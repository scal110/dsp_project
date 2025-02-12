# DSP Project

## Project Structure
The structure of this repository is organized as follows:

- **`JSON Schemas`**: Contains the design of the JSON schemas used for validating requests and responses.
- **`REST APIs Design`**: Includes the OpenAPI document describing the design of the REST APIs.
- **`Postman collection`**: Includes example API invocations in a Postman collection, generated based on the **`openapi.yaml`** file
- **`Film Manager Implementation`**: Contains the Film Manager service application, implemented starting from a server stub generated using Swagger Editor from the designed REST APIs.

---

## Starting Point and Extensions
The starting point for this project was my personal solution for Lab01. To fulfill the Exam Assignment requirements, several extensions were implemented:

### Database Extensions
- A new table, `review_modifications`, was added to represent review modification requests.
- Each review modification request is identified by:
  - **`mId`**: A unique identifier for the modification request.
  - **`filmId`** and **`reviewerId`**: Foreign keys linking the request to the associated review.
- The **`mId`** allows multiple modification requests for the same review, but only one pending request is permitted at a time.
- **`deadline`** Specifies the mandatory date and time in ISO 8601 format (e.g., 2025-01-16T23:59:59Z) by which the request must be processed.
- **`accepted`** Indicates the actual status of the request

### Review Modification Request States
The status of a modification request can be one of the following:
- **`true`**: The request has been accepted.
- **`false`**: The request has been rejected.
- **`null`**: The request is in a pending state.

### Deadline Management
- The deadline is expressed in the following ISO 8601 format: `YYYY-MM-DDThh:mm:ssZ`.
- To minimize overhead, expired requests are handled dynamically. When a GET operation is performed on an expired resource, the system automatically rejects the request.
- The function responsible for managing expiration is **`updateStatusAfterExpiration`**, located in `./Film Manager Implementation/service/ReviewModificationService.js`. This function is invoked within the **`parseReviewModification`** function, which is used whenever a row is retrieved from the `review_modifications` table.

### Review Modification Request Operations
- An **authenticated user** can create a review modification request for one of their completed reviews by specifying a deadline. The filmId and reviewerId are passed as path parameters, while the deadline is included in the request bod
- The **film owner** can update the request status (accept or reject).
- When a request is accepted, the `completed` status of the corresponding review is set to `false`, enabling the reviewer to perform all permitted operations on it, such as completing or deleting the review.
- The operations to accept or reject a request are implemented as separate properties to adhere to the **HATEOAS** principle.
- These properties are displayed only if the authenticated user is the film owner.

### HATEOAS Integration
- **`accept`**: Represents the URI to accept a pending request. This property is shown only if the authenticated user is the film owner.
- **`reject`**: Represents the URI to reject a pending request. This property is shown only if the authenticated user is the film owner.
- **`self`**: Represents the URI to access a single `review_modification` resource.
- **`delete`**: Represents the URI to delete a pending request. This property is shown only if the authenticated user is the one who created the request.

---

## Key Design Choices

1. **Dynamic Deadline Management**:
   - Expired requests are updated only when accessed, reducing the overhead of periodically checking all rows.

2. **Role-Based Access Control**:
   - Only the film owner can accept or reject a request.
   - The reviewer who created the request can delete it while it is pending.
   - Other users cannot access sensitive details about modification requests.

3. **HATEOAS Principles**:
   - Each operation is exposed as a specific property (e.g., `accept`, `reject`, `delete`) to guide the user through valid actions.

4. **Separation of Concerns**:
   - The database schema is designed to ensure clarity and prevent conflicts, allowing only one pending request per review at a time.
