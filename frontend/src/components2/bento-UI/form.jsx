import * as React from "react";
import * as FormPrimitive from "@radix-ui/react-form";

const Form = FormPrimitive.Root;

const FormField = React.forwardRef(({ className, ...props }, ref) => (
  <FormPrimitive.Field
    ref={ref}
    className={`mb-4 ${className}`}
    {...props}
  />
));
FormField.displayName = "FormField";

const FormLabel = React.forwardRef(({ className, ...props }, ref) => (
  <FormPrimitive.Label
    ref={ref}
    className={`mb-2 block text-sm font-medium text-text ${className}`}
    {...props}
  />
));
FormLabel.displayName = "FormLabel";

const FormControl = FormPrimitive.Control;

const FormMessage = React.forwardRef(({ className, ...props }, ref) => (
  <FormPrimitive.Message
    ref={ref}
    className={`mt-1 text-sm text-primary ${className}`}
    {...props}
  />
));
FormMessage.displayName = "FormMessage";

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={`flex h-10 w-full rounded-lg border border-accent/20 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));
Input.displayName = "Input";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none text-text peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  />
));
Label.displayName = "Label";

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-[80px] w-full rounded-lg border border-accent/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-text/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Label,
  Textarea,
};