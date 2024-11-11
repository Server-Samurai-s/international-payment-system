# Create CA directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "."

# Generate root CA private key
openssl genrsa -out rootCA.key 2048

# Generate root CA certificate
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem `
    -subj "/C=ZA/ST=WC/L=Cape Town/O=APDS Security/CN=APDS Root CA"

# Generate server private key
openssl genrsa -out server.key 2048

# Generate server CSR
openssl req -new -key server.key -out server.csr `
    -config ../../server.conf

# Generate server certificate
openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial `
    -out server.crt -days 365 -sha256 -extensions req_ext -extfile ../../server.conf

# Clean up
Remove-Item server.csr
Remove-Item rootCA.srl

Write-Host "Certificates generated successfully!" 