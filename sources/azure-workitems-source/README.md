# Azure-WorkItems Source

This is the WorkItemsitory for the Azure-WorkItems source connector, written in Typescript.
For information about how to use this connector within Airbyte, see [the
documentation](https://docs.airbyte.io/integrations/sources/azure-workitems).

## Local development

### Prerequisites

**To iterate on this connector, make sure to complete this prerequisites
section.**

#### Minimum Node.js version required `= 14.5`

#### Build connector

From the root repository directory (NOT this folder), run:

```
npm run prepare
```

This will install all required dependencies and build all included connectors,
including the Azure-WorkItems source connector.

Now you can cd into the Azure-WorkItems connector directory, `sources/azure-workitems-source`,
and iterate on the Azure-WorkItems source connector. After making code changes, run:

```
npm run build
```

#### Create credentials

Follow the instructions in the
[documentation](https://docs.airbyte.io/integrations/sources/azure-workitems) to
generate the necessary credentials. Then create a file `secrets/config.json`
conforming to the `resources/spec.json` file. Note that any directory named
`secrets` is gitignored across the entire `airbyte-connectors` repos, so there is
no danger of accidentally checking in sensitive information. See
`test_files/config.json` for a sample config file.

### Locally running the connector

```
bin/main spec
bin/main check --config secrets/config.json
bin/main discover --config secrets/config.json
bin/main read --config secrets/config.json --catalog test_files/full_configured_catalog.json > log.json
```

### Locally running the connector docker image

#### Build

Go back to the root repository directory and run:
First, make sure you build the latest Docker image:

```
docker build . --build-arg path=sources/azure-workitems-source --build-arg version=0.0.1 -t flowyzer/azure-workitems-source
```

#### Run

Then return to the Azure-WorkItems connector directory and run any of the connector
commands as follows:

```
docker run --rm flowyzer/azure-workitems-source spec
docker run --rm -v $(pwd)/secrets:/secrets flowyzer/azure-workitems-source check --config /secrets/config.json
docker run --rm -v $(pwd)/secrets:/secrets flowyzer/azure-workitems-source discover --config /secrets/config.json
docker run --rm -v $(pwd)/secrets:/secrets -v $(pwd)/test_files:/test_files flowyzer/azure-workitems-source read --config /secrets/config.json --catalog /test_files/full_configured_catalog.json
```

## Testing

### Unit Tests

To run unit tests locally, from the Azure-WorkItems connector directory run:

```
npm test
```

### Acceptance Tests

Customize `acceptance-test-config.yml` file to configure tests. See [Source
Acceptance
Tests](https://docs.airbyte.io/connector-development/testing-connectors/source-acceptance-tests-reference)
for more information.
Pull the latest Airbyte Source Acceptance Test docker image by running:

```
docker pull airbyte/source-acceptance-test
```

To run the acceptance tests, from the root repository directory, run

```
./scripts/source-acceptance-test.sh azure-repoworkitemss-source
```

## Dependency Management

We use [lerna](https://lerna.js.org/) to manage dependencies that are shared by
all connectors in this repository. Dependencies specific to this connector
should go in the connector's `package.json`. Dependencies shared by all
connectors, such as linting/formatting tools, should go in the root
`package.json`.


## Use in AirByte Portal

Now you can import this as a new destination in AirByte. Use `flowyzer/azure-workitems-source` as the docker image name. 