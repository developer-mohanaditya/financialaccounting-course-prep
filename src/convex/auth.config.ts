/**
 * JWT / issuer configuration.
 *
 * This is a **self-issued** token: the issuer is this deployment, validated
 * through the OIDC discovery document that `http.ts` serves. There is no `kid`
 * header and no JWKS URL, which is exactly why this must not be a
 * `customJwt` entry — that path needs both, and swapping to it does not throw:
 * sign-in appears to succeed, the token is rejected, and every protected route
 * quietly redirects to the sign-in page forever.
 *
 * Add `customJwt` only as an *additional* entry, for a genuinely external
 * federated issuer. Never as a replacement for this one.
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: 'convex',
    },
  ],
};
