import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  personalDataSchema,
  type PersonalDataFormValues,
} from "./personalDataSchema";

type PersonalDataFormProps = {
  onSubmit: (data: PersonalDataFormValues) => Promise<void>;
  isPending: boolean;
};

export function PersonalDataForm({ onSubmit, isPending }: PersonalDataFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">Vorname</Label>
        <Input
          id="firstName"
          type="text"
          autoComplete="given-name"
          disabled={isPending}
          aria-invalid={!!errors.firstName}
          {...register("firstName")}
        />
        {errors.firstName && (
          <p className="text-sm text-destructive">{errors.firstName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Nachname</Label>
        <Input
          id="lastName"
          type="text"
          autoComplete="family-name"
          disabled={isPending}
          aria-invalid={!!errors.lastName}
          {...register("lastName")}
        />
        {errors.lastName && (
          <p className="text-sm text-destructive">{errors.lastName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
        <Input
          id="dateOfBirth"
          type="date"
          autoComplete="bday"
          disabled={isPending}
          aria-invalid={!!errors.dateOfBirth}
          {...register("dateOfBirth")}
        />
        {errors.dateOfBirth && (
          <p className="text-sm text-destructive">
            {errors.dateOfBirth.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Wird verschlüsselt und übermittelt..." : "Weiter"}
      </Button>
    </form>
  );
}
