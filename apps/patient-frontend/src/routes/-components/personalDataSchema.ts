import { z } from "zod";

export const personalDataSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  dateOfBirth: z
    .string()
    .min(1, "Geburtsdatum ist erforderlich")
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Bitte geben Sie ein gültiges Datum ein" }
    )
    .refine(
      (val) => {
        const date = new Date(val);
        return date <= new Date();
      },
      { message: "Geburtsdatum darf nicht in der Zukunft liegen" }
    ),
});

export type PersonalDataFormValues = z.infer<typeof personalDataSchema>;
