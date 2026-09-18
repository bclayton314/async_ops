# AsyncOps Architecture

## Overview

AsyncOps is a web-based collaboration platform for distributed
software teams.

The application uses a client-server architecture consisting of a
React frontend, FastAPI backend, and PostgreSQL database.

## Current Architecture

```text
Browser
   |
   v
React + TypeScript
   |
   | HTTP / REST
   v
FastAPI
   |
   v
SQLAlchemy
   |
   v
PostgreSQL