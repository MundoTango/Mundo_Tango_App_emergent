import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
// Router import handled via wouter below
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Heart, Shield, Users, Globe, CheckCircle, UserCheck, MessageSquare, AlertTriangle, Flag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';

const codeOfConductSchema = z.object({
  respectfulBehavior: z.boolean().refine(val => val === true, "You must agree to be respectful"),
  friendlyEnvironment: z.boolean().refine(val => val === true, "You must agree to keep it friendly"),
  consentRequired: z.boolean().refine(val => val === true, "You must agree to share with consent"),
  appropriateContent: z.boolean().refine(val => val === true, "You must agree to keep content appropriate"),
  reportingPolicy: z.boolean().refine(val => val === true, "You must agree to report problems gently"),
  communityValues: z.boolean().refine(val => val === true, "You must agree to build something good together"),
  termsOfService: z.boolean().refine(val => val === true, "You must agree to the terms of service and privacy policy"),
});

type CodeOfConductData = z.infer<typeof codeOfConductSchema>;

export default function CodeOfConduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<CodeOfConductData>({
    resolver: zodResolver(codeOfConductSchema),
    defaultValues: {
      respectfulBehavior: false,
      friendlyEnvironment: false,
      consentRequired: false,
      appropriateContent: false,
      reportingPolicy: false,
      communityValues: false,
      termsOfService: false,
    },
  });

  const acceptCodeOfConductMutation = useMutation({
    mutationFn: async (data: CodeOfConductData) => {
      return apiRequest("/api/code-of-conduct/accept", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Mundo Tango!",
        description: "You've successfully joined our community. Let's start dancing!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Navigation will be handled automatically by App.tsx routing logic
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept code of conduct. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CodeOfConductData) => {
  const { t } = useTranslation();
    acceptCodeOfConductMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 dark:via-blue-900/20 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Heart className="w-20 h-20 mx-auto text-pink-500 animate-pulse hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-bounce flex items-center justify-center">
              <span className="text-white dark:text-gray-900 dark:text-white text-xl">🌱</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 dark:via-purple-500 to-blue-600 dark:to-blue-500 bg-clip-text text-transparent">
            Code of Conduct
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            A space for connection, creativity, and mutual respect
          </p>
          <p className="text-sm text-gray-500">{t('common.effective_date_june_27_2025')}</p>
        </div>

        {/* Introduction */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white dark:from-gray-900 via-blue-50 dark:via-blue-900/20 to-cyan-50">
          <CardContent className="p-8">
            <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed text-center">
              Mundo Tango is a space for connection, creativity, and mutual respect. Everyone is here to enjoy, share, and grow — so we keep things simple and kind.
            </p>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Be Respectful */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white dark:from-gray-900 to-pink-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-colors">
                      <UserCheck className="w-6 h-6 text-pink-600" />
                    </div>
                    <CardTitle className="text-xl text-pink-700">{t('common.be_respectful')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 leading-relaxed">
                    Treat others the way you'd like to be treated. Don't be rude, aggressive, or dismissive — in words, comments, or behavior.
                  </p>
                  <FormField
                    control={form.control}
                    name="respectfulBehavior"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-pink-200 p-3 bg-pink-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            I agree to be respectful to all community members
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Keep It Friendly */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white dark:from-gray-900 to-blue-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 transition-colors">
                      <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-blue-700">{t('common.keep_it_friendly')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    This isn't the place for political arguments, personal attacks, or divisive topics. Focus on what brings us together: dance, music, events, and memory.
                  </p>
                  <FormField
                    control={form.control}
                    name="friendlyEnvironment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-blue-200 p-3 bg-blue-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            I will keep discussions friendly and focused
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Share With Consent */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white dark:from-gray-900 to-green-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:bg-green-200 transition-colors">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl text-green-700">{t('common.share_with_consent')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Only tag, post, or share photos or videos that others have agreed to. Respect people's privacy and comfort.
                  </p>
                  <FormField
                    control={form.control}
                    name="consentRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-green-200 p-3 bg-green-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            I will only share content with proper consent
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Don't Be Foul */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white dark:from-gray-900 to-purple-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full group-hover:bg-purple-200 transition-colors">
                      <AlertTriangle className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl text-purple-700">{t('common.dont_be_foul')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    No bullying, hate speech, threats, or inappropriate language. Keep it clean and decent for all ages and regions.
                  </p>
                  <FormField
                    control={form.control}
                    name="appropriateContent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-purple-200 p-3 bg-purple-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            I will keep my content appropriate and respectful
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Report Problems Gently */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white dark:from-gray-900 to-orange-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                      <Flag className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl text-orange-700">{t('common.report_problems_gently')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    If something doesn't feel right, let us know. Reporting is confidential and reviewed with care.
                  </p>
                  <FormField
                    control={form.control}
                    name="reportingPolicy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-orange-200 p-3 bg-orange-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            I will report problems constructively and respectfully
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Let's Build Something Good */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white dark:from-gray-900 to-cyan-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-100 rounded-full group-hover:bg-cyan-200 transition-colors">
                      <Users className="w-6 h-6 text-cyan-600" />
                    </div>
                    <CardTitle className="text-xl text-cyan-700">{t('common.lets_build_something_good')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Whether you're dancing, organizing, teaching, or just exploring — bring your best self, and let others do the same.
                  </p>
                  <FormField
                    control={form.control}
                    name="communityValues"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-cyan-200 p-3 bg-cyan-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            I commit to building something good together
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Terms of Service Agreement */}
            <Card className="mt-6 border-0 shadow-2xl bg-gradient-to-r from-white dark:from-gray-900 via-cyan-50 to-blue-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-800">{t('common.final_agreement')}</CardTitle>
                <p className="text-gray-600">{t('common.please_confirm_you_agree_to_all_our_terms_and_poli')}</p>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="termsOfService"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-300 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-800/50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-base font-medium text-gray-800">
                          I agree to the Terms of Service, Privacy Policy, and Code of Conduct
                        </FormLabel>
                        <p className="text-sm text-gray-500">
                          By checking this box, you confirm that you have read and agree to our complete terms and policies.
                        </p>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="pt-6 text-center">
              <div className="relative inline-block group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-cyan-400 to-blue-400 rounded-xl blur opacity-75 group-hover:opacity-100 group-hover:blur-sm transition duration-300"></div>
                <Button
                  type="submit"
                  disabled={acceptCodeOfConductMutation.isPending}
                  className="relative w-full sm:w-auto min-w-[300px] h-14 bg-gradient-to-r from-cyan-600 via-blue-600 dark:via-blue-500 to-purple-600 dark:to-purple-500 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white dark:text-gray-900 dark:text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group-hover:shadow-cyan-500/25 disabled:hover:scale-100 disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-3">
                    {acceptCodeOfConductMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white dark:border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                        Joining Community...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 group-hover:animate-pulse" />
                        Join Mundo Tango Community
                        <Heart className="w-5 h-5 group-hover:animate-bounce text-pink-200" />
                      </>
                    )}
                  </span>
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Welcome to the global tango family!
              </p>
            </div>
          </form>
        </Form>

        {/* Contact Information */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 dark:from-gray-800 to-blue-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('common.questions_or_concerns')}</h3>
            <p className="text-gray-600">
              Contact us at <span className="font-medium text-blue-600">{t('common.supportmundotangolife')}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}