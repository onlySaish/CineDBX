# CineDBX: Advanced Database Management System (ADBMS) Documentation

This document serves as an in-depth companion to the CineDBX project. It breaks down the internal workings of the backend, the crucial database architectural choices made, and provides a comprehensive Viva (Oral Exam) preparation guide.

---

## 🏗️ 1. Detailed Project Working

CineDBX relies on a multi-tier architecture to securely process thousands of complex concurrent interactions seamlessly between the relational database and the user.

### A. The Schema & Workflow Pipeline
1. **Selection Tier:** The frontend allows filtering cascading dimensions. Instead of flat queries, the database relies on strict referential integrity between `movie`, `theatre`, `hall`, `showtimes`, and `shown_in`.
2. **Concurrency Control (The Seat Matrix):** When two customers load the same movie hall, they both execute `POST /seats`. 
   - Before insertion, the app utilizes **Pessimistic-like Row Locking** logic by inserting their temporary choice into `seat_lock`.
   - The database instantly blocks simultaneous transactions from attempting to insert matching `(seat_id, showtime_id)` keys via a `UNIQUE KEY` constraint, eliminating duplicate selections before payment.
3. **Transaction Fulfillment:** Upon clicking "Confirm Purchase", the system executes `POST /purchaseTicket` which generates a final unalterable `ticket` insertion while *simultaneously* deleting the temporary safety row inside `seat_lock`.
4. **Data Aggregation:** User dashboards hit `POST /customerPurchases`, parsing multiple inner joins (`person -> payment -> ticket -> movie -> theatre`) grouped explicitly to safely comply with rigorous `ONLY_FULL_GROUP_BY` strict schema modes.

---

## ⚡ 2. Indexing Strategy & Implementations

A core ADBMS feature inside CineDBX is structural Indexing via B-Trees. Without indexing, MySQL evaluates conditional constraints by linearly reading every single row table by table (`O(N)` full table scan). Indexing reorganizes those columns logarithmically (`O(log N)`), making massive datasets instantly searchable.

### Active Indexes Implemented
* **Ticket Showtimes Index** (`idx_ticket_showtime` on `ticket(showtimes_id)`)
  - **Why:** The primary bottleneck for `/seats` load times involves grouping previously bought tickets over a specific timeslot.
  - **Impact:** MySQL jumps directly to the node pointing to the requested `showtimes_id` rather than searching a lifetime history of millions of bookings. 
* **Seat Lock Unique Constraint** (`unique_seat_lock` on `seat_lock(seat_id, showtime_id)`)
  - **Why:** InnoDB engines natively treat `UNIQUE CONSTRAINT` rules as instant composite B-Tree indexes.
  - **Impact:** This single key enforces database-level ACID isolation. If two users click a seat at the identical millisecond, the exact combination `(seat_45, showtime_15)` is rejected for User 2 natively at the hardware level instantly.
* **Chronological Showtime Filters** (`idx_showtime_date` on `showtimes(showtime_date)`)
  - **Why:** Sorting operations (`ORDER BY showtime_date DESC`) are heavily taxing in standard queries.
  - **Impact:** The B-Tree structure naturally stores the items chronologically. The database retrieves the 4 most recent dates instantly without launching an expensive full-table sort algorithm.

---

## 🎯 3. VIVA Preparation Guide

Use these exact technical responses to confidently showcase the depth of your ADBMS integration during your evaluation.

### Q1. "What technique did you use to prevent two users from booking the same seat simultaneously?"
**Answer:** "We implemented an exclusive database-level locking concurrency mechanism through a dedicated `seat_lock` table. When User A clicks a seat, an API call instantly inserts a row binding their `user_email`, `seat_id` and `showtime_id`. Because that table holds a `UNIQUE KEY` composite over `(seat_id, showtime_id)`, if User B attempts to select the identical seat simultaneously, MySQL physically rejects the `INSERT` via a duplicate entry error (`ER_DUP_ENTRY`). This relies on database isolation constraints rather than weak frontend validations."

### Q2. "What happens if a user locks a seat but closes their browser without buying it?"
**Answer:** "We designed an automated garbage-collection failsafe using timestamps. During the initial insertion, the backend injects an `expires_at` column evaluating to `NOW() + INTERVAL 5 MINUTE`. Whenever any user requests the seating layout subsequently, the backend silently executes a `DELETE FROM seat_lock WHERE expires_at < NOW()` execution first. This strictly prevents orphaned locks from holding theatre seats hostage permanently."

### Q3. "Why did you implement explicitly named Indexes instead of relying solely on your Primary Keys?"
**Answer:** "Primary Keys implicitly optimize localized direct lookups, but in our booking environment, data retrieval frequently relies heavily on Foreign Keys mappings inside massive `.WHERE` or `JOIN` conditions. For instance, compiling the `/seats` layout requires scanning thousands of rows matching `T.showtimes_id = ?`. Creating `idx_ticket_showtime` converts an expensive `O(N)` linear full table scan into an `O(log N)` localized B-Tree traversal mapping, improving query resolution from whole seconds to milliseconds under load."

### Q4. "How did you manage the `ONLY_FULL_GROUP_BY` strict mode error in your dashboards?"
**Answer:** "MySQL 5.7+ rigorously enforces structural query logic, causing queries that `SELECT` un-aggregated fields that aren't strictly included in the `GROUP BY` clause to fail for security reasons. To fix dashboard generation failures within `/customerPurchases`, we restructured the query to explicitly enumerate all functionally dependent columns (email, image_path, movie name) correctly within the Group By syntax, creating strict SQL standard compliance."

### Q5. "Is your system utilizing Optimistic or Pessimistic Concurrency logic?"
**Answer:** "Our implementation mimics **Pessimistic Concurrency** via custom row-level abstraction. Rather than allowing everyone to progress to the payment gateway and only raising errors upon the final Ticket `INSERT` (Optimistic), we actively block the resource early the instant intent is shown (via `/lockSeat`), rejecting other users at the initial selection layer to massively improve the user experience."

### Q6. "How does CineDBX enforce Referential Integrity?"
**Answer:** "We heavily rely on strong Foreign Key (FK) relationships. For instance, the `ticket` table relies on FKs mapping `payment_id`, `seat_id`, `hall_id`, `movie_id`, and `showtimes_id`. If an admin attempts to delete a `movie` that has existing ticket relationships, or if an insertion utilizes an invalid `seat_id`, MySQL natively prevents the query. This strict parent-child schema ensures no orphaned records manipulate the ecosystem."

### Q7. "Can you define the ACID properties inside the context of your booking system?"
**Answer:** 
- **Atomicity:** When confirming a purchase, the system must both drop the temporary `seat_lock` and insert the final `ticket`. If either operation crashes, the application state must rollback entirely instead of partially corrupting the tables.
- **Consistency:** The `UNIQUE KEY` on `(seat_id, showtime_id)` guarantees the underlying physical configuration inherently prevents double-booking scenarios.
- **Isolation:** Multiple customers fetching `/seats` layouts seamlessly process their API calls isolated from each other via InnoDB's Multi-Version Concurrency Control (MVCC) locking protocols without experiencing 'dirty reads'.
- **Durability:** Once the `ticket` insertion returns "success", the reservation is durably persisted onto the local disk disk memory securely surviving potential instantaneous hardware restarts.

### Q8. "What normal form is your schema currently modeling?"
**Answer:** "The database closely models the **Third Normal Form (3NF)**. To eliminate transitive dependencies alongside multi-valued columns, we extracted specific attributes. Instead of storing `director` and `genre` details repetitively inside the `movie` table, we established dedicated `movie_directors` and `movie_genre` tables exclusively mapping back to a `movie_id`, inherently enforcing functional scalability."

### Q9. "Explain what 'GROUP_CONCAT' achieves in your historical purchases query?"
**Answer:** "A single Customer Payment ID logic can easily purchase multiple unique seats inside one transaction. Performing a standard scalar JOIN would structurally return $N$ duplicated rows representing that same isolated transaction for each seat mapping. By utilizing `GROUP_CONCAT(ST.name SEPARATOR ', ')`, the SQL engine dynamically groups all associated seat titles (e.g., 'E1, E2, E3') compiling them back into a single isolated row string, drastically improving the frontend network parsing!"

### Q10. "If the application scaled globally 100x faster, how would you optimize the DB next?"
**Answer:** "While our composite B-tree indexes correctly lower complexity configurations from massive `O(N)` scans to strict `O(log N)` traversals, true global scaling bottleneck failures arise due strictly to max connection pools. I would transition highly predictable static fetches—such as retrieving localized `theatre` listings—into a lightning-fast Key-Value cache layer like Redis, freeing up exact InnoDB threading instances strictly towards authenticating intensive writes corresponding directly to Seat Bookings."
