"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { lecturerSchema, type LecturerInput } from "@/lib/validations";
import { createLecturer, updateLecturer } from "@/lib/actions/lecturers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Profile } from "@/lib/database.types";

export function LecturerDialog({ lecturer }: { lecturer?: Profile }) {
  const [open, setOpen] = useState(false);
  const isEdit = !!lecturer;

  const form = useForm<LecturerInput>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: { full_name: lecturer?.full_name ?? "", email: lecturer?.email ?? "" },
  });

  async function onSubmit(values: LecturerInput) {
    try {
      if (isEdit) {
        await updateLecturer(lecturer.id, values);
        toast.success("Lecturer updated");
      } else {
        await createLecturer(values);
        toast.success("Lecturer added — an invite email has been sent");
        form.reset();
      }
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Add lecturer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lecturer" : "Add a lecturer"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this lecturer's details." : "They'll receive an email to set their password."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Femi Adeyemi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="femi.adeyemi@pspoly.edu.ng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add lecturer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
