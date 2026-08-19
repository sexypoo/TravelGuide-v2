# Production auth provider setup

The code exposes only provider groups whose environment variables are complete.
Never commit the values below.

## Shared public origin

Set the backend `WEB_ORIGIN` to the canonical web origin:

```text
https://www.travelguide.kr
```

Register these exact redirect URIs in each provider console:

```text
https://www.travelguide.kr/api/v1/auth/oauth/google/callback
https://www.travelguide.kr/api/v1/auth/oauth/kakao/callback
https://www.travelguide.kr/api/v1/auth/oauth/apple/callback
```

## Password reset mail

1. Verify `travelguide.kr` in Resend and configure SPF/DKIM records.
2. Create a sending-only API key.
3. Set `RESEND_API_KEY` and an `EMAIL_FROM` value such as
   `여쭈어 <no-reply@travelguide.kr>`.
4. Request a reset for a non-admin test account and verify that the link uses
   HTTPS, expires after 30 minutes, and cannot be reused.

## Google

- Create a Web application OAuth client and configure the Google consent
  screen.
- Set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`.
- Request only `openid email profile`; the backend rejects an unverified email.

## Kakao

- Activate Kakao Login, register the web origin and redirect URI, and enable
  the email and profile nickname consent items.
- Keep the client secret feature enabled.
- Set the REST API key as `KAKAO_OAUTH_CLIENT_ID` and the client secret as
  `KAKAO_OAUTH_CLIENT_SECRET`.

## Apple

- Enable Sign in with Apple for the App ID and create an associated Services
  ID for the web flow.
- Create a Sign in with Apple private key and keep the `.p8` content only in the
  backend secret store.
- Set `APPLE_OAUTH_CLIENT_ID` to the Services ID, plus
  `APPLE_OAUTH_TEAM_ID`, `APPLE_OAUTH_KEY_ID`, and
  `APPLE_OAUTH_PRIVATE_KEY`. An environment value may encode line breaks as
  `\\n`.

## Release order

1. Add secrets without restarting the old backend if the platform permits it.
2. Deploy the backend and run `prisma migrate deploy`.
3. Deploy the frontend.
4. Confirm `/api/v1/auth/capabilities` lists only the intended providers.
5. Exercise login and registration once for every provider on web, Android,
   and iOS before store submission.
