/**
 * UI primitive components
 *
 * Re-exported from this barrel so consumers can write:
 *   import { Button, Badge, Card, CardHeader, CardBody, CardFooter } from "@/components/ui"
 */

export { Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { Badge } from "./Badge";
export type { BadgeProps, BadgeVariant } from "./Badge";

export { Card, CardHeader, CardBody, CardFooter } from "./Card";
export type {
  CardProps,
  CardElevation,
  CardRootElement,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from "./Card";
