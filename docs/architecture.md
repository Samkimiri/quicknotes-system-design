
# QuickNotes System Architecture

## Functional requirements

- Users can register, authenticate, create, read, update and delete their notes.
- Users can tag notes and search or filter them.
- Users can only access notes they are authorized to view.

## Non-functional requirements

- Scale to one million registered users.
- Maintain availability through redundancy and health checks.
- Use HTTPS, authentication, authorization and encrypted backups.
- Support horizontal scaling and monitor latency and failures.

## Capacity estimates

Assumptions: 1,000,000 registered users; 10% active daily; each active user performs 50 feed/list reads and creates 1 note daily; 365 days per year; average stored note data is 2 KB; estimates exclude indexes, replicas and backups.

- Daily active users: 1,000,000 × 10% = 100,000.
- Reads per day: 100,000 × 50 = 5,000,000.
- Average reads/second: 5,000,000 / 86,400 = about 58.
- Writes per day: 100,000.
- Average writes/second: 100,000 / 86,400 = about 1.16.
- Annual note storage: 100,000 × 365 × 2 KB = 73 GB/year.

These are average estimates; production capacity must also account for peak traffic, growth and actual note sizes.

## Architecture diagram

```text
Clients
   |
 DNS
   |
 CDN (static assets)
   |
 Load Balancer
   |
   +-------------------+
   |                   |
 App Server 1       App Server 2
   |                   |
   +---------+---------+
             |
         Cache (Redis)
             |
      +------+------+
      |             |
 Primary DB ----> Read Replica
      |
   Job Queue
      |
    Worker
```

The queue and worker handle asynchronous tasks such as notifications or future export processing. Note content remains in the database.

## Component responsibilities

- **Client:** Provides the web interface for note operations.
- **DNS:** Resolves the service domain to its entry point.
- **CDN:** Caches static assets near users and reduces origin traffic.
- **Load balancer:** Distributes requests and removes unhealthy application servers.
- **App servers:** Validate requests, enforce permissions and implement API logic.
- **Cache:** Reduces repeated database reads for frequently accessed data.
- **Primary database:** Stores authoritative user, note and tag records.
- **Read replica:** Serves eligible read queries and reduces primary database load.
- **Queue:** Buffers background work so requests need not wait for it.
- **Worker:** Processes queued jobs independently of user-facing requests.

## GET /notes flow

1. The client sends an authenticated `GET /notes` request.
2. DNS resolves the API hostname; the load balancer routes to a healthy app server.
3. The app server validates the token and confirms the user's identity.
4. The app checks the cache for the user's notes.
5. On a cache miss, it queries the read replica when replication freshness is acceptable, otherwise the primary.
6. The server returns paginated JSON with `200 OK`; suitable results may be cached.

## POST /notes flow

1. The client sends an authenticated POST request with a JSON title and body.
2. The load balancer routes the request to a healthy app server.
3. The app validates the request and authorizes the user.
4. The app inserts the note into the primary database in a transaction.
5. The app invalidates affected cache entries and queues optional background work.
6. The server returns the created note with `201 Created`.

## Trade-offs and resilience

- **Cache speed versus freshness:** Cached data is fast but may be stale; use expiration and invalidate affected entries after writes.
- **Read replica performance versus consistency:** Replication can lag; use the primary for read-after-write requests when necessary.
- **Background processing versus immediate completion:** Queues improve responsiveness but jobs may be delayed; use retries and dead-letter handling.
- **Cost versus availability:** Multiple app servers and database replicas cost more, but reduce downtime.

Avoid single points of failure by running multiple app-server instances across failure zones, using redundant load-balancer infrastructure, deploying highly available cache and queue services, and configuring database backups and tested failover to a standby replica. A read replica alone is not a complete backup or guaranteed automatic failover solution.
