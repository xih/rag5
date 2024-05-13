// 1. add shadcn
// 2. add a form
// 3. make it responsive and deploy to vercel
// 4. yarn add zod@3.22.4 to fix the zod error
// 5. add a submit button that has a loading state

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useState } from "react";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

const paperSchema = z.object({
  paperUrl: z.string(),
  name: z.string(),
  pagesToDelete: z.string(),
});

function delayHalfSecond() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof paperSchema>>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      paperUrl: "https://arxiv.org/pdf/2312.01725",
      name: "StableVITON: Learning Semantic Correspondence with Latent Diffusion Model for Virtual Try-On",
      pagesToDelete: "10, 11, 12",
    },
  });

  console.log("is loading", isLoading);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof paperSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(isLoading, "is Loading");
    console.log(values);
    setIsLoading(true);
    await delayHalfSecond();
    setIsLoading(false);
    console.log(isLoading, "is Loading");
  }

  return (
    <div className="flex flex-col max-w-lg-[1200px] mt-10">
      <div className="flex justify-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-5/12 max-w-lg-[1200px]"
          >
            <FormField
              control={form.control}
              name="paperUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paper Url</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>this is your paper URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of Paper</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>Name of Paper</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pagesToDelete"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pages to Delete?</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>pages to delete</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoading ? (
              <Button>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit">Submit</Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
