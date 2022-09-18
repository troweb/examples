import * as fs from "node:fs/promises"
import fetch, { fileFromSync, FormData } from "node-fetch"
import { createClient, gql } from "urql"
import * as dotenv from "dotenv"
dotenv.config()

// Types
export type FileInfo = {
  fileName: string
  fileSize: number
  mimeType: string
}

export type SignedUrl = {
  _id: string
  fileName: string
  blobType: string
  url: string
  formFields: string
}

// Queries
const gqlClient = createClient({
  url: "https://example.troweb.app/api/v1/graphql",
  // exchanges: [dedupExchange, fetchExchange], // to disable cahce
  fetchOptions: () => {
    const token = process.env.TROWEB_API_KEY
    return {
      headers: { authorization: token ? `Bearer ${token}` : "" },
    }
  },
})

const getSignedUrlsQuery = gql`
  query GetSignedUrls(
    $blobsInfo: [UploadBlobInfoInput!]!
    $collectionId: ObjectId!
  ) {
    getBlobUploadSignedUrl(blobsInfo: $blobsInfo, collectionId: $collectionId) {
      _id
      fileName
      blobType
      url
      formFields
    }
  }
`

/** Obtains Signed URLs for the provided files used to upload them */
export const getSignedUrls = async (
  files: FileInfo[],
  collectionId: string
): Promise<SignedUrl[]> => {
  return gqlClient
    .query(getSignedUrlsQuery, { blobsInfo: files, collectionId })
    .toPromise()
    .then(result => {
      if (result.error) {
        console.error("Error getting signed URLs: ", result.error.message)
        throw result.error
      }
      return result.data?.getBlobUploadSignedUrl as SignedUrl[]
    })
}

/** Takes Signed URLs obtained by `getSignedUrls` function and uploads the files */
export const uploadFiles = async (
  signedUrls: SignedUrl[],
  filePaths: { [key: string]: string }
) => {
  return signedUrls.map(async s => {
    const formData = new FormData()
    const formFields = await JSON.parse(s.formFields)
    for (const k in formFields) {
      formData.set(k, formFields[k])
    }
    formData.set("file", fileFromSync(filePaths[s.fileName]), s.fileName)
    const response = await fetch(s.url, { method: "POST", body: formData })
    console.log("RESPONSE DATA: ", await response.json())
  })
}

/** Runs the script */
export const run = async () => {
  const fileInfos: FileInfo[] = [
    {
      fileName: "report.txt",
      fileSize: await fs.stat("./files/report.txt").then(info => info.size),
      mimeType: "text/plain",
    },
    {
      fileName: "logo.png",
      fileSize: await fs.stat("./files/logo.png").then(info => info.size),
      mimeType: "image/png",
    },
  ]
  const filePaths: { [key: string]: string } = {
    "report.txt": "./files/report.txt",
    "logo.png": "./files/logo.png",
  }

  const signedUrls = await getSignedUrls(fileInfos, "000000000000000000000000")
  console.log("SIGNED URLS: ", signedUrls)

  const uploadedFiles = await uploadFiles(signedUrls, filePaths)
  console.log("UPLOADED FILES: ", uploadFiles)
}

export default run
