**WEB**  
***
- General
  - Evaluate replace confirm modals for vuestic's confirm Method 
  - Implement a mecanism to prevent user for data loss if a page has changes that are not saved and the user tries to navigate away from the page or changing active context (for example, by closing the tab or going to another page).
- AdminNewInstitutionPage.vue
  - Set a length limit for each text field, and validate on frontEnd and Backend 
  - Validate text fields against RegExp
  - Improve visual success message with a resume of the created institution

**API**
***
- General
  - Evaluate the use of Zod for Services that want to create Documents in Firestore, before to persist the document, to validate the data against the Zod schema, and return a clear error message if the validation fails.
  - Notify by email the user when a new permission is created and a link to access it. When is consecuence of the creation of a new institution, include the details of the institution 
  - Validate if originTraceId it's taked from the request in firebase functions or not