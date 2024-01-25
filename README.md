# acs-image-scan
This action can be used to run a container vulnerability scan on an image using Red Hat Advanced Cluster Security for Kubernetes

# Usage
```yaml
- uses: rprakashg-redhat/acs-image-scanl@main
  with:
    # Central endpoint
    central: ""

    # ROX Api token
    api-token: ""

    # Container Image to run a vulnerability scan on
    image: ""

    # output format valid values (table|csv|json|sarif)
    output: ""

    # directory where the vulnerability scan output report should be created
    output-path: ""
```


## Example 
```yaml
name: example
on:
  workflow_dispatch:
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: rprakashg-redhat/setup-roxctl@main
      - name: run image scan
        uses: ./
        with:
          image: "ghcr.io/rprakashg-redhat/eventscheduler@sha256:ba9347ae0d0857ea9b11d1e7bb63e86c960cb9d670cf48330b4e22fd9fd1e4df"
          api-token: ${{ secrets.ROX_API_TOKEN }}
          central: ${{ secrets.ROX_CENTRAL }}
          output: table
          output-path: ${{ runner.temp }}
```

