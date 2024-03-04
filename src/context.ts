import { ITokenContent } from "keycloak-backend";

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
    keycloak: ITokenContent;
}
