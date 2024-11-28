# connect-sendgrid-integration
This repository provides a [connect](https://docs.commercetools.com/connect) template for a email integration connector for notification performed by sendgrid.

This template uses the [Customer](https://docs.commercetools.com/api/projects/customers),  [Order](https://docs.commercetools.com/api/projects/orders) data models from commercetools composable commerce. Template is based on [Subscriptions](https://docs.commercetools.com/api/projects/subscriptions) to communicate with the external email provider asynchronously.

## Template Features
- NodeJS supported.
- Uses Express as web server framework.
- Uses [commercetools SDK](https://docs.commercetools.com/sdk/js-sdk-getting-started) for the commercetools-specific communication.
- Includes local development utilities in npm commands to build, start, test, lint & prettify code.
- Uses JSON formatted logger with log levels
- Setup sample unit and integration tests with [sinon](https://sinonjs.org/), [Jest](https://jestjs.io/) and [supertest](https://github.com/ladjs/supertest#readme)

## Prerequisite
#### 1. commercetools composable commerce API client
Users are expected to create API client responsible for fetching customer and order details from composable commerce project, API client should have enough scope to be able to do so. These API client details are taken as input as an environment variable/ configuration for connect. Details of composable commerce project can be provided as environment variables (configuration for connect) `CTP_PROJECT_KEY` , `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`, `CTP_SCOPE`, `CTP_REGION`. For details, please read [Deployment Configuration](./README.md#deployment-configuration).

#### 2. Sendgrid Account
- Users are expected to create api clients/ keys in Sendgrid. Those details are taken as input as an environment variable / configuration for connect. API token to external email service provider can be provided as environment variables (configuration for connect) `EMAIL_PROVIDER_API_KEY`. For details, please read [Deployment Configuration](./README.md#deployment-configuration).
- In additions, users are expected to create their own email template on the platform of email service provider for following operations :
1. Customer Registration
2. Password Reset Token Generation
4. Order Confirmation
5. Order/Shipment State Update
6. Order Refund

The keys or identifiers of templates built in external email provider can be provided as several environment variables (configuration for connect) `CUSTOMER_REGISTRATION_TEMPLATE_ID`, `ORDER_CONFIRMATION_TEMPLATE_ID`, `ORDER_STATE_CHANGE_TEMPLATE_ID` and `ORDER_REFUND_TEMPLATE_ID`. For details, please read [Deployment Configuration](./README.md#deployment-configuration).
 
## Getting started
The template contains following module :  
- Mail Sender: Receives message from commercetools project once there is an operation in customer or order as listed [here](./README.md#2-external-email-service-provider). The order and its corresponding cart details are then synchronized to the external tax provider for accounting and compliance purposes in addition to filing tax returns with tax authorities.

Regarding the development of mail sender module, please refer to the following documentations:
- [Development of Mail Sender](mail-sender/README.md)

#### 1. Develop your specific needs 
To send email notification with corresponding order/customer details via external email provider, users need to extend this connector with the following task
- API communication: Implementation to communicate between this connector application and the external system using libraries provided by external email provider. Please remember that the email notification request might not be sent to email provider API successfully in a single attempt. It should have needed retry and recovery mechanism.

#### 2. Register as connector in commercetools Connect
Follow guidelines [here](https://docs.commercetools.com/connect/getting-started) to register the connector for public/private use.

## Deployment Configuration
In order to deploy your customized connector application on commercetools Connect, it needs to be published. For details, please refer to [documentation about commercetools Connect](https://docs.commercetools.com/connect/concepts)
In addition, in order to support connect, the tax integration connector template has a folder structure as listed below
```
├── mail-sender
│   ├── src
│   ├── test
│   └── package.json
└── connect.yaml
```

Connect deployment configuration is specified in `connect.yaml` which is required information needed for publishing of the application. Following is the deployment configuration used by full ingestion and incremental updater modules
```
deployAs:
  - name: mail-sender
    applicationType: event
    endpoint: /mail-sender
    scripts:
      postDeploy: npm install && npm run connector:post-deploy
      preUndeploy: npm install && npm run connector:pre-undeploy
    configuration:
      standardConfiguration:
        - key: CTP_REGION
          description: commercetools Composable Commerce API region
        - key: CTP_PROJECT_KEY
          description: commercetools Composable Commerce project key
        - key: CTP_CLIENT_ID
          description: commercetools Composable Commerce client ID
        - key: CTP_SCOPE
          description: commercetools Composable Commerce client scope
        - key: SENDER_EMAIL_ADDRESS
          description: sender's email address displayed in the email
        - key: CUSTOMER_REGISTRATION_TEMPLATE_ID
          description: Identifier of customer registration email template stored in email service provider
        - key: CUSTOMER_EMAIL_TOKEN_CREATION_TEMPLATE_ID
          description: Identifier of email token creation email template stored in email service provider
        - key: CUSTOMER_PASSWORD_TOKEN_CREATION_TEMPLATE_ID
          description: Identifier of password token creation email template stored in email service provider
        - key: ORDER_CONFIRMATION_TEMPLATE_ID
          description: Identifier of order confirmation email template stored in email service provider
        - key: ORDER_STATE_CHANGE_TEMPLATE_ID
          description: Identifier of order state change / shipment state change email template stored in email service provider
        - key: ORDER_REFUND_TEMPLATE_ID
          description: Identifier of order refund email template stored in email service provider
        - key: CUSTOMER_PASSWORD_TOKEN_CREATION_TEMPLATE_ID
          description: Identifier of password token creation email template stored in email service provider
      securedConfiguration:
        - key: CTP_CLIENT_SECRET
          description: commercetools Composable Commerce client secret
        - key: EMAIL_PROVIDER_API_KEY
          description: The API key used to communicate with email provider


```

Here you can see the details about various variables in configuration
- CTP_PROJECT_KEY: The key of commercetools composable commerce project.
- CTP_CLIENT_ID: The client ID of your commercetools composable commerce user account. It is used in commercetools client to communicate with commercetools composable commerce via SDK.
- CTP_CLIENT_SECRET: The client secret of commercetools composable commerce user account. It is used in commercetools client to communicate with commercetools composable commerce via SDK.
- CTP_SCOPE: The scope constrains the endpoints to which the commercetools client has access, as well as the read/write access right to an endpoint.
- CTP_REGION: As the commercetools composable commerce APIs are provided in six different region, it defines the region which your commercetools composable commerce user account belongs to.
- EMAIL_PROVIDER_API_KEY: It defines the API key provided by the external email service provider, which is used to access their API from the connector application.
- SENDER_EMAIL_ADDRESS: It defines the email address of sender, which is passed to email template stored in email service provider so that it can be displayed in email notification.
- CUSTOMER_REGISTRATION_TEMPLATE_ID: It defines the key or identifier of customer registration email template stored in email service provider.
- ORDER_CONFIRMATION_TEMPLATE_ID: It defines the key or identifier of order confirmation email template stored in email service provider.
- ORDER_STATE_CHANGE_TEMPLATE_ID: It defines the key or identifier of order/shipment state change email template stored in email service provider.
- ORDER_REFUND_TEMPLATE_ID: It defines the key or identifier of order refund email template stored in email service provider.
