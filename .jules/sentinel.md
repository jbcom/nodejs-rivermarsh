## 2024-05-22 - Insecure Deserialization in Local Storage
**Vulnerability:** Game state loaded from `localStorage` was blindly trusted and cast to TypeScript interfaces (`as SaveData`) without runtime validation.
**Learning:** TypeScript interfaces do not provide runtime safety. Data from external sources (even localStorage) must be treated as untrusted.
**Prevention:** Implement runtime validation (e.g., custom type guards or libraries like Zod) for all data loaded from storage or APIs.
