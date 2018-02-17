# Ambassify Query Language

Ambassify Query Language is a query language for API's that can be expressed in JSON. This repo provides its spec as well as tooling and some implementations.

The problem it tries to solve is that of providing a uniform way to request and modify resources in a microservice architecture where you don't necessarily want each and every service to implement the specific filtering, mutating, sorting, ... behaviours of the other services it depends on.

By using AQL, services should be able to split out parts of a query and delegate them to other services if necessary without having to translate parts of the query to a specific format the other service will understand.

Another advantage would be that client libraries of services that support AQL will be very similar, possibly allowing for a generic client that works for all AQL-enabled services.

For more information about the query language and how to write queries in it, see the [aql-spec repository](/packages/spec)