import { gql, GraphQLClient } from 'graphql-request'
import 'dotenv/config'

/* Configs and constants */
const ORGANIZATION_DOMAIN = process.env.ORGANIZATION_DOMAIN || 'example.troweb.app'
const TARGET_COLLECTION_ID = process.env.TARGET_COLLECTION_ID || ''
const TROWEB_API_KEY = process.env.TROWEB_API_KEY || ''

const requestHeaders = { authorization: `Bearer ${TROWEB_API_KEY}` }
const graphqlEndpoint = `${ORGANIZATION_DOMAIN}/api/v1/graphql`
const graphqlClient = new GraphQLClient(graphqlEndpoint, { headers: requestHeaders })


/* Define interface based on Troweb schema */
interface programmingLanguageSchema {
  title: string
  website: string
  designers: string[]
  description: string
}

/* Data (items of type ProgrammingLanguages) */
export const programmingLanguages: programmingLanguageSchema[] = [
  {
    title: 'GoLang',
    website: 'go.dev',
    designers: ['Robert Griesemer', 'Rob Pike', 'Ken Thompson'],
    description: 'Go is a statically typed, compiled programming language designed at Google by Robert Griesemer, Rob Pike, and Ken Thompson. It is syntactically similar to C, but with memory safety, garbage collection, structural typing, and CSP-style concurrency.',
  },
  {
    title: 'JavaScript',
    website: 'javascript.com',
    designers: ['Brendan Eich of Netscape initially'], // Others have also contributed to the ECMAScript standard
    description: 'JavaScript, often abbreviated JS, is a programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS. Over 97% of websites use JavaScript on the client side for web page behavior, often incorporating third-party libraries.',
  },
  {
    title: 'Python',
    website: 'python.org',
    designers: ['Guido van Rossum'],
    description: 'Python is a high-level, interpreted, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation. Python is dynamically-typed and garbage-collected.',
  },
]

/* Define the graphql query */
export const createProgrammingLanguagesQuery = gql`
  mutation createProgrammingLanguages (
    $programmingLanguages: [InsertProgrammingLanguages_ProgrammingLanguageItems!]!
    $collectionId: ObjectId!
  ) {
    createProgrammingLanguages(items: $programmingLanguages, parentId: $collectionId) {
      _id
      title
      website
      designers
      description
    }
  }
`

/* The inserter function */
export const createProgrammingLanguages = async (languages: programmingLanguageSchema[], collectionId: string) => {
  console.log(`Creating ${languages.length} Programming Languages in collection ${collectionId}`)

  /* send the request */
  const result = await graphqlClient.request(createProgrammingLanguagesQuery, {
    programmingLanguages: languages,
    collectionId,
  })

  /* extract the result */
  const createdItems = result.createProgrammingLanguages
  console.log(`Created ${createdItems.length} Programming Languages successfully`)
  return createdItems
}

/* Run the script */
export const createTopProgrammingLanguagesInTroweb = async () => {
  console.log('Programming Languages to Create: ', programmingLanguages)
  const createdLanguages = await createProgrammingLanguages(programmingLanguages, TARGET_COLLECTION_ID)
  console.log('Created Programming Languages: ', createdLanguages)
}
