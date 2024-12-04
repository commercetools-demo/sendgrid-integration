# Mail Sender

This module provides an application based on [commercetools Connect](https://docs.commercetools.com/connect), which
receives messages from commercetools project once one of following operations takes place :

1. Customer Registration
4. Order Confirmation
5. Order/Shipment State Update
6. Order Refund

The corresponding customer details or order details would be fetched from composable commerce platform, and then be
submitted to email service provider for email notification.

The module also provides scripts for post-deployment and pre-undeployment action. After deployment via connect service
completed, [commercetools Subscription](https://docs.commercetools.com/api/projects/subscriptions) is created by
post-deployment script which listen to any related customer and order operations in commercetools Project. Once any
actions above is triggered, the commercetools Subscription sends message to Google Cloud Pub/Sub topic and then notify
the mail sender to handle the corresponding changes.

The commercetools Subscription would be cleared once the email integration connector is undeployed.

## Get started

#### Change the key of commercetools Subscription

Please specify your desired key for creation of commercetools
Subscription [here](https://github.com/commercetools/connect-email-integration-template/blob/80f96ab78a3c9a9402f4a16b2e15b7875b1355a0/mail-sender/src/connector/actions.js#L8).
The default key is 'ct-connect-email-delivery-subscription'.

#### Customize parameters for email template ####

In mail-sender we have already provided default parameters as below based on different operations. These parameters act
as data to be inserted into email template for notification.

Customer Registration

```
┌----------------------------------------------------------------------------------------┐
|   Parameters                     |   Description                                       |
|----------------------------------|-----------------------------------------------------|
|   customerEmail                  |   Recipient email address                           |
|   customerNumber                 |   Customer number defined in commercetools platform |
|   customerFirstName              |   First name of the customer                        |
|   customerLastName               |   Last name of the customer                         |
|   customerCreationTime           |   Registration time of the customer                 |
|   customerCreationDate           |   Registration date of the customer                 |
|   customerEmailToken             |   The token generated for password flow             |
|   customerEmailTokenValidityDate |   The validity of the password token as date        |
|   customerEmailTokenValidityTime |   The validity of the password token as time        |
└----------------------------------------------------------------------------------------┘
```

Password Reset Token Creation

``` 
┌----------------------------------------------------------------------------------------------------┐
|   Parameters                           |   Description                                             |
|----------------------------------------|-----------------------------------------------------------|
|   customerEmail                        |   Recipient email address                                 |
|   customerNumber                       |   Customer number defined in commercetools platform       |
|   customerFirstName                    |   First name of the customer                              |
|   customerLastName                     |   Last name of the customer                               |
|   customerCreationDate                 |   Date of the email token generation                      |
|   customerCreationTime                 |   Time of the email token generation                      |
|   customerPasswordToken                |   The token generated for password reset purpose          |
|   customerPasswordTokenValidityDate    |   The validity of the password reset token as date        |
|   customerPasswordTokenValidityTime    |   The validity of the password reset token as time        |
└----------------------------------------------------------------------------------------------------┘ 
```

Order Confirmation

``` 
┌------------------------------------------------------------------------------------------------------------------------------------------------┐
|   Parameters                               |   Description                                                                                     |
|--------------------------------------------|---------------------------------------------------------------------------------------------------|
|   orderNumber                              |   Recipient email address                                                                         |
|   customerEmail                            |   Email address of customer linked to the order                                                   |
|   customerFirstName                        |   First name of the customer                                                                      |
|   customerLastName                         |   Last name of the customer                                                                       |
|   orderCreationTime                        |   Time of the order creation                                                                      |
|   orderCreationDate                        |   Date of the order creation                                                                      |
|   orderTotalPrice                          |   The total price of the order                                                                    |
|   orderTaxedPrice                          |   The price of the order after the tax calculation                                                |
|   orderLineItems                           |   A list of line items included in the specific order                                             |
|       orderLineItems[n].productName        |   Product name in English of the line item                                                        |
|       orderLineItems[n].productQuantity    |   The  quantity of the ordered line item                                                          |
|       orderLineItems[n].productSku         |   The SKU of the ordered line item                                                                |
|       orderLineItems[n].productImage       |   The image URL of the ordered line item. The default image would be in small size.               |
|                                            |   For details, please refer to https://docs.commercetools.com/api/projects/products#image         |
|       orderLineItems[n].productSubTotal    |   The subtotal price of the line item                                                             |
└------------------------------------------------------------------------------------------------------------------------------------------------┘ 
```

Order/Shipment State Change

``` 
┌-----------------------------------------------------------------------------------------------------------------------------------------------┐
|   Parameters                              |   Description                                                                                     |
|-------------------------------------------|---------------------------------------------------------------------------------------------------|
|   orderNumber                             |   Recipient email address                                                                         |
|   customerEmail                           |   Email address of customer linked to the order                                                   |
|   customerFirstName                       |   First name of the customer                                                                      |
|   customerLastName                        |   Last name of the customer                                                                       |
|   orderCreationTime                       |   Time of the order creation                                                                      |
|   orderCreationDate                       |   Date of the order creation                                                                      |
|   orderState                              |   Current state of the order                                                                      |
|   orderShipmentState                      |   Current state of the shipment                                                                   |
|   orderTotalPrice                         |   The total price of the order                                                                    |
|   orderTaxedPrice                         |   The price of the order after the tax calculation                                                |
|   orderLineItems                          |   A list of line items included in the specific order                                             |
|       orderLineItems[n].productName       |   Product name in English of the line item                                                        |
|       orderLineItems[n].productQuantity   |   The  quantity of the ordered line item                                                          |
|       orderLineItems[n].productSku        |   The SKU of the ordered line item                                                                |
|       orderLineItems[n].productImage      |   The image URL of the ordered line item. The default image would be in small size.               |
|       orderLineItems[n].productSubTotal   |   The subtotal price of the line item                                                             |
└-----------------------------------------------------------------------------------------------------------------------------------------------┘ 
```

Order Refund

``` 
┌--------------------------------------------------------------------------------------------------------------------------------------------┐
|   Parameters                               |   Description                                                                                 |
|--------------------------------------------|-----------------------------------------------------------------------------------------------|
|   orderNumber                              |   Recipient email address                                                                     |
|   customerEmail                            |   Email address of customer linked to the order                                               |
|   customerFirstName                        |   First name of the customer                                                                  |
|   customerLastName                         |   Last name of the customer                                                                   |
|   orderCreationTime                        |   Time of the order creation                                                                  |
|   orderCreationDate                        |   Date of the order creation                                                                  |
|   orderTotalPrice                          |   The total price of the order                                                                |
|   orderTaxedPrice                          |   The price of the order after the tax calculation                                            |
|   orderLineItems                           |   A list of line items included in the specific order which is going to be returned           |
|       orderLineItems[n].productName        |   Product name in English of the line item                                                    |
|       orderLineItems[n].productQuantity    |   The  quantity of the ordered line item                                                      |
|       orderLineItems[n].productSku         |   The SKU of the ordered line item                                                            |
|       orderLineItems[n].productImage       |   The image URL of the ordered line item. The default image would be in small size.           |
|       orderLineItems[n].productSubTotal    |   The subtotal price of the line item                                                         |
└--------------------------------------------------------------------------------------------------------------------------------------------┘ 
```

To display values of these parameters during email notification, the email templates in email service provider should
contain placeholders with the same parameter names, so that the above values can be inserted into email templates.

#### Install your email-provider SDK

Please run following npm command under mail-sender folder to install the NodeJS SDK provided by email service provider.

```
$ npm install <email-service-provider-sdk>
```

#### Install dependencies

```
$ npm install
```

#### Run unit test

```
$ npm run test:unit
```

#### Run integration test

```
$ npm run test:integration
```

#### Run the application in local environment

```
$ npm run start
```

#### Run post-deploy script in local environment

```
$ npm run connector:post-deploy
```

#### Run pre-undeploy script in local environment

```
$ npm run connector:pre-undeploy
```

## Development in local environment

Different from staging and production environments, in which the out-of-the-box setup and variables have been set by
connect service during deployment, the mail-sender requires additional operations in local environment for development.

#### Create Google Cloud pub/sub topic and subscription

When an event-type connector application is deployed via connect service, a GCP pub/sub topic and subscription are
created automatically. However it does not apply on local environment. To develop the mail-sender in local environment,
you need to follow the steps below:

1. Create a Pub/Sub topic and subscription in Google Cloud platform.
2. Use HTTP tunnel tools like [ngrok](https://ngrok.com/docs/getting-started) to expose your local development server to
   internet.
3. Set the URL provided by the tunnel tool as the destination of GCP subscription, so that message can be forwarded to
   the mail-sender in your local environment.

For details, please refer to
the [Overview of the GCP Pub/Sub service](https://cloud.google.com/pubsub/docs/pubsub-basics).

#### Set the required environment variables

Before starting the development, we advise users to create a .env file in order to help them in local development.

For that, we also have a template file .env.example with the required environment variables for the project to run
successfully. To make it work, rename the file from `.env.example` to `.env`. Remember to fill the variables with your
values.

In addition, following two environment variables in `.env.example` are not needed to be provided by users during staging
or production deployment.

```
CONNECT_GCP_TOPIC_NAME=<your-gcp-topic-name>
CONNECT_GCP_PROJECT_ID=<your-gcp-project-id>
```

It is because they are only required in local development server. For staging or production environment, connect service
sets the Pub/Sub topic name and GCP project ID into these environment variables automatically after the Pub/Sub service
has been created in Google Cloud platform. 