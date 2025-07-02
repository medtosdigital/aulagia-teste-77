import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// New component for colored material type header
const MaterialCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    materialType: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
    subject?: string;
  }
>(({ className, materialType, subject, children, ...props }, ref) => {
  const getTypeConfig = (type: string) => {
    const configs = {
      'plano-de-aula': {
        label: 'Plano de Aula',
        bgGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
        badgeColor: 'bg-blue-100 text-blue-700'
      },
      'slides': {
        label: 'Slides',
        bgGradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
        badgeColor: 'bg-gray-100 text-gray-700'
      },
      'atividade': {
        label: 'Atividade',
        bgGradient: 'bg-gradient-to-r from-green-500 to-green-600',
        badgeColor: 'bg-green-100 text-green-700'
      },
      'avaliacao': {
        label: 'Avaliação',
        bgGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
        badgeColor: 'bg-purple-100 text-purple-700'
      }
    };
    return configs[type as keyof typeof configs] || configs['atividade'];
  };

  const typeConfig = getTypeConfig(materialType);

  return (
    <div
      ref={ref}
      className={cn(`${typeConfig.bgGradient} p-4 text-white relative`, className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm">{typeConfig.label}</span>
        </div>
        {subject && (
          <span className={`${typeConfig.badgeColor} border-0 text-xs font-medium px-2 py-1 rounded-full`}>
            {subject}
          </span>
        )}
      </div>
      {children}
    </div>
  );
});
MaterialCardHeader.displayName = "MaterialCardHeader"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, MaterialCardHeader }
