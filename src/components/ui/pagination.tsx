
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <ul
      ref={ref}
      className={cn(
        "flex flex-row items-center gap-1", 
        isMobile ? "gap-2" : "gap-1",
        className
      )}
      {...props}
    />
  );
})
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => {
  const isMobile = useIsMobile();
  const mobileSize = isMobile ? "default" : size;
  
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size: mobileSize,
        }),
        isM && "h-12 w-12 text-base",
        className
      )}
      {...props}
    />
  );
}
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const isMobile = useIsMobile();
  
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn(
        "gap-1 pl-2.5", 
        isMobile ? "h-12 px-4 text-base" : "",
        className
      )}
      {...props}
    >
      <ChevronLeft className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
      <span className={isMobile ? "text-base" : ""}>Previous</span>
    </PaginationLink>
  );
}
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const isMobile = useIsMobile();
  
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn(
        "gap-1 pr-2.5", 
        isMobile ? "h-12 px-4 text-base" : "",
        className
      )}
      {...props}
    >
      <span className={isMobile ? "text-base" : ""}>Next</span>
      <ChevronRight className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
    </PaginationLink>
  );
}
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => {
  const isMobile = useIsMobile();
  
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 items-center justify-center", 
        isMobile ? "h-12 w-12" : "",
        className
      )}
      {...props}
    >
      <MoreHorizontal className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
      <span className="sr-only">More pages</span>
    </span>
  );
}
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
