# CypherScan Directus

Directus extension for scanning uploaded files with CypherScan before they reach production workflows.

## Links

- npm: https://www.npmjs.com/package/cypherscan-directus
- GitHub: https://github.com/cyphernetsecurity/cypherscan-directus
- CypherScan: https://cyphernetsecurity.com

---

## Features

- Malware scanning
- ClamAV detection
- Upload security
- S3-based scanning pipeline
- Optional blocking of infected files
- Directus hook integration
- CypherScan API support

---

## Installation

Install the package:

```bash
npm install cypherscan-directus
```

Build the extension:

```bash
npm run build
```

Copy the built extension into your Directus project:

```text
extensions/directus-extension-cypherscan
```

Restart Directus.

---

## Configuration

Environment variables:

```env
CYPHERSCAN_API_KEY=your_api_key
CYPHERSCAN_API_BASE_URL=https://cyphernetsecurity.com
CYPHERSCAN_BLOCK_INFECTED=true
```

### CYPHERSCAN_API_KEY

API key generated from the CypherScan dashboard.

### CYPHERSCAN_API_BASE_URL

CypherScan API endpoint.

Default:

```env
https://cyphernetsecurity.com
```

### CYPHERSCAN_BLOCK_INFECTED

When enabled:

```env
true
```

infected uploads are automatically deleted.

When disabled:

```env
false
```

uploads are scanned but retained.

---

## How It Works

1. User uploads a file to Directus
2. Extension receives the upload event
3. File is uploaded to CypherScan secure scanning storage
4. CypherScan scans the file
5. A verdict is returned
6. Optional blocking removes infected files

---

## Example Log

```text
[cypherscan-directus] scanning: invoice.pdf
[cypherscan-directus] result: invoice.pdf verdict=clean blocked=false
```

---

## Example Scan Response

```json
{
  "verdict": "clean",
  "blocked": false,
  "scanId": "sc_xxxxxxxxxxxxxxxxx",
  "riskLevel": "low"
}
```

---

## Requirements

- Directus
- CypherScan API Key
- Internet access for scan requests

---

## License

MIT

Copyright (c) CypherNet Security