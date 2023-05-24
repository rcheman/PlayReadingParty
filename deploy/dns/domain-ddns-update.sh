#!/bin/bash

API_KEY=""

# Domain hosted with Gandi
DOMAIN="playreadingparty.com"

# Get external IP address
EXT_IP=$(curl -s icanhazip.com)

echo -e "Setting playreadingparty.com to $EXT_IP\n"

# Update the A Record of the subdomain using PUT
curl -v -X PUT \
    -H "Content-Type: application/json" \
    -H "authorization: Apikey $API_KEY" \
    -d "{\"rrset_values\": [\"$EXT_IP\"],\"rrset_ttl\": 300}" \
    https://api.gandi.net/v5/livedns/domains/$DOMAIN/records/@/A


# todo add support for CAA
# @ 300 IN CAA 128 issue "letsencrypt.org"
