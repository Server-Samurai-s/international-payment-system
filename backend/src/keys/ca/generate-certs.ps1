# Create CA directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "."

# Set your OpenSSL path
$OPENSSL = "C:\Program Files\OpenSSL-Win64\bin\openssl.exe"

# Generate root CA private key
& $OPENSSL genrsa -out rootCA.key 2048

# Generate root CA certificate
& $OPENSSL req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem `
    -subj "/C=ZA/ST=WC/L=Cape Town/O=APDS Security/CN=APDS Root CA"

# Generate server private key
& $OPENSSL genrsa -out server.key 2048

# Generate server CSR
& $OPENSSL req -new -key server.key -out server.csr `
    -config ../../../server.conf

# Generate server certificate
& $OPENSSL x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial `
    -out server.crt -days 365 -sha256 -extensions req_ext -extfile ../../../server.conf

# Clean up (only remove if files exist)
if (Test-Path server.csr) {
    Remove-Item server.csr
}
if (Test-Path rootCA.srl) {
    Remove-Item rootCA.srl
}

Write-Host "Certificates generated successfully!"