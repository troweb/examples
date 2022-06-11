# Simple Item Inserter Script

Inserter script is a simple function to add a few items to a [Troweb collection](https://nightly.docs.troweb.com/concepts/content-management/collection) with a dead simple [schema](https://nightly.docs.troweb.com/concepts/schema/) called "ProgrammingLanguage".

## Schema
The item schema for this script is called **"ProgrammingLanguage"**.
```ts
interface programmingLanguageSchema {
  title: string
  website: string
  designers: string[]
  description: string
}
```


## Items (Programming Languages)
Here are some programming languages to use in our script to import them to our collection
```ts
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
```


## Query
The GraphQL query would look like this: (types can be found on [graphql playground docs](https://docs.troweb.com/developer/api/#graphql-playground))
```gql
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
```


## Inserter Function
Now we can use all the stuff to write our inserter function:
```ts
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
```


## Run the function
The inserter function can be used inside other functions like this:
```ts
export const createTopProgrammingLanguagesInTroweb = async () => {
  console.log('Programming Languages to Create: ', programmingLanguages)
  const createdLanguages = await createProgrammingLanguages(programmingLanguages, TARGET_COLLECTION_ID)
  console.log('Created Programming Languages: ', createdLanguages)
}
```
