import { KeycloakToken } from "@nexirift/plugin-keycloak";

/**
 * Represents the context object used in the application.
 */
export interface Context {
    /**
     * The request object.
     */
    req: any;
    /**
     * The response object.
     */
    res: any;
    /**
     * The Keycloak token content.
     */
    keycloak: KeycloakToken;
}
