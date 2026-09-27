/**
 * HTTP routes.
 *
 * This file is small and easy to forget, and its absence fails *quietly*: the
 * database rows are right and sign-in works server-side, but the browser never
 * gets the discovery document it needs to confirm a session, so protected views
 * bounce back to the start screen with no error anywhere.
 *
 * It serves OIDC discovery at
 *   ${CONVEX_SITE_URL}/.well-known/openid-configuration
 * which is how the client validates the tokens `auth.ts` issues.
 */

import { httpRouter } from 'convex/server';
import { auth } from './auth';

const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
