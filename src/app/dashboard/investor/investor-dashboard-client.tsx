"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
  PieChart,
  ArrowUpRight,
  MapPin,
  Home,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { requestFunding, withdrawFundingRequest } from "@/lib/actions/investor-actions";

interface Deal {
  id: string;
  status: string;
  asking_price: number;
  offer_price: number | null;
  final_price?: number | null;
  priority: string;
  submitted_at: string;
  property: {
    address: string;
    city: string;
    state: string;
    property_type: string;
    bedrooms: number | null;
    bathrooms: number | null;
    sqft: number | null;
  } | null;
  underwriting: {
    arv: number;
    max_offer: number;
    risk_score: number | null;
  } | null;
}

interface FundingRequest {
  id: string;
  deal_id: string;
  requested_amount: number;
  approved_amount: number | null;
  funded_amount: number | null;
  status: string;
  requested_at: string;
  deals?: {
    id: string;
    status: string;
    asking_price: number;
    offer_price: number | null;
    properties: {
      address: string;
      city: string;
      state: string;
    } | null;
  };
}

interface Stats {
  totalFunded: number;
  pendingFunding: number;
  activeDeals: number;
  closedDeals: number;
  totalInvested: number;
  totalReturns: number;
  roi: number;
}

interface InvestorDashboardClientProps {
  availableDeals: Deal[];
  myDeals: Deal[];
  fundingRequests: FundingRequest[];
  stats: Stats;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  under_review: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  funded: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  withdrawn: "bg-muted text-foreground/90 dark:bg-card/30 dark:text-muted-foreground",
};

const dealStatusColors: Record<string, string> = {
  offer_prepared: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  offer_sent: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  in_contract: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  funding: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  closed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export function InvestorDashboardClient({
  availableDeals,
  myDeals,
  fundingRequests,
  stats,
}: InvestorDashboardClientProps) {
  const router = useRouter();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingNotes, setFundingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleRequestFunding = async () => {
    if (!selectedDeal || !fundingAmount) return;
    
    setIsSubmitting(true);
    const amount = parseFloat(fundingAmount.replace(/[^0-9.]/g, ""));
    
    const result = await requestFunding(selectedDeal.id, amount, fundingNotes);
    
    if (result.error) {
      toast.error("Failed to submit request", { description: result.error });
    } else {
      toast.success("Funding request submitted", { 
        description: "Your request is now pending review" 
      });
      setSelectedDeal(null);
      setFundingAmount("");
      setFundingNotes("");
      router.refresh();
    }
    
    setIsSubmitting(false);
  };

  const handleWithdraw = async (fundingId: string) => {
    setWithdrawingId(fundingId);
    const result = await withdrawFundingRequest(fundingId);
    
    if (result.error) {
      toast.error("Failed to withdraw", { description: result.error });
    } else {
      toast.success("Request withdrawn");
      router.refresh();
    }
    
    setWithdrawingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-secondary border-border dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
              Total Invested
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground dark:text-white">
              {formatCurrency(stats.totalInvested)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Across {stats.closedDeals + stats.activeDeals} deals
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-secondary border-border dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
              Pending Funding
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground dark:text-white">
              {formatCurrency(stats.pendingFunding)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-secondary border-border dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
              Active Deals
            </CardTitle>
            <Building2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground dark:text-white">
              {stats.activeDeals}
            </div>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-secondary border-border dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
              ROI
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground dark:text-white">
              {stats.roi > 0 ? "+" : ""}{stats.roi}%
            </div>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              {stats.closedDeals} closed deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="bg-muted dark:bg-secondary">
          <TabsTrigger value="available">
            Available Deals ({availableDeals.length})
          </TabsTrigger>
          <TabsTrigger value="my-deals">
            My Portfolio ({myDeals.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Funding Requests ({fundingRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Deals */}
        <TabsContent value="available" className="space-y-4">
          {availableDeals.length === 0 ? (
            <Card className="bg-white dark:bg-secondary border-border dark:border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground dark:text-white">
                  No Available Deals
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Check back later for new investment opportunities
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableDeals.map((deal) => (
                <Card 
                  key={deal.id} 
                  className="bg-white dark:bg-secondary border-border dark:border-border hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge className={dealStatusColors[deal.status] || "bg-muted"}>
                        {deal.status.replace("_", " ")}
                      </Badge>
                      {deal.underwriting?.risk_score && (
                        <Badge variant="outline" className="text-muted-foreground dark:text-muted-foreground">
                          Risk: {deal.underwriting.risk_score}/10
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground dark:text-white">
                          {deal.property?.address}
                        </p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                          {deal.property?.city}, {deal.property?.state}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        {deal.property?.property_type}
                      </div>
                      {deal.property?.sqft && (
                        <span>{deal.property.sqft.toLocaleString()} sqft</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border dark:border-border">
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground">Asking</p>
                        <p className="font-semibold text-foreground dark:text-white">
                          {formatCurrency(deal.asking_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground">Max Offer</p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {deal.underwriting?.max_offer 
                            ? formatCurrency(deal.underwriting.max_offer) 
                            : "TBD"}
                        </p>
                      </div>
                    </div>

                    {deal.underwriting?.arv && (
                      <div className="flex items-center justify-between text-sm bg-muted dark:bg-card p-2 rounded">
                        <span className="text-muted-foreground dark:text-muted-foreground">ARV</span>
                        <span className="font-medium text-foreground dark:text-white">
                          {formatCurrency(deal.underwriting.arv)}
                        </span>
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Request Funding
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Portfolio */}
        <TabsContent value="my-deals" className="space-y-4">
          {myDeals.length === 0 ? (
            <Card className="bg-white dark:bg-secondary border-border dark:border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground dark:text-white">
                  No Investments Yet
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Browse available deals to start investing
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-secondary border-border dark:border-border">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-white">My Portfolio</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                  Deals you&apos;ve invested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border dark:border-border">
                      <TableHead className="text-muted-foreground dark:text-muted-foreground">Property</TableHead>
                      <TableHead className="text-muted-foreground dark:text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground dark:text-muted-foreground text-right">Investment</TableHead>
                      <TableHead className="text-muted-foreground dark:text-muted-foreground text-right">Value</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myDeals.map((deal) => (
                      <TableRow key={deal.id} className="border-border dark:border-border">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground dark:text-white">
                              {deal.property?.address}
                            </p>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              {deal.property?.city}, {deal.property?.state}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={dealStatusColors[deal.status] || "bg-muted"}>
                            {deal.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground dark:text-white">
                          {formatCurrency(deal.offer_price || deal.asking_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {deal.status === "closed" && deal.final_price ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {formatCurrency(deal.final_price)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/deals/${deal.id}`)}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Funding Requests */}
        <TabsContent value="requests" className="space-y-4">
          <Card className="bg-white dark:bg-secondary border-border dark:border-border">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white">Funding Requests</CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                Track your funding request status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fundingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground">
                  No funding requests yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border dark:border-border">
                      <TableHead className="text-muted-foreground dark:text-muted-foreground">Property</TableHead>
                      <TableHead className="text-muted-foreground dark:text-muted-foreground">Requested</TableHead>
                      <TableHead className="text-muted-foreground dark:text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground dark:text-muted-foreground">Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fundingRequests.map((request) => (
                      <TableRow key={request.id} className="border-border dark:border-border">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground dark:text-white">
                              {request.deals?.properties?.address || "—"}
                            </p>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              {request.deals?.properties?.city}, {request.deals?.properties?.state}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground dark:text-white">
                          {formatCurrency(request.requested_amount)}
                          {request.approved_amount && request.approved_amount !== request.requested_amount && (
                            <span className="block text-sm text-emerald-600 dark:text-emerald-400">
                              Approved: {formatCurrency(request.approved_amount)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[request.status]}>
                            <span className="flex items-center gap-1">
                              {request.status === "funded" && <CheckCircle className="h-3 w-3" />}
                              {request.status === "pending" && <Clock className="h-3 w-3" />}
                              {request.status === "declined" && <AlertCircle className="h-3 w-3" />}
                              {request.status.replace("_", " ")}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground dark:text-muted-foreground">
                          {new Date(request.requested_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {(request.status === "pending" || request.status === "under_review") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWithdraw(request.id)}
                              disabled={withdrawingId === request.id}
                            >
                              {withdrawingId === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Withdraw"
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Funding Request Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="bg-white dark:bg-secondary border-border dark:border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-white">Request Funding</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
              Submit a funding request for this property
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeal && (
            <div className="space-y-4">
              <div className="p-4 bg-muted dark:bg-card rounded-lg">
                <p className="font-medium text-foreground dark:text-white">
                  {selectedDeal.property?.address}
                </p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {selectedDeal.property?.city}, {selectedDeal.property?.state}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground dark:text-muted-foreground">Asking:</span>{" "}
                    <span className="font-medium text-foreground dark:text-white">
                      {formatCurrency(selectedDeal.asking_price)}
                    </span>
                  </div>
                  {selectedDeal.underwriting?.max_offer && (
                    <div>
                      <span className="text-muted-foreground dark:text-muted-foreground">Max Offer:</span>{" "}
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(selectedDeal.underwriting.max_offer)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/90 dark:text-foreground/90">
                  Funding Amount
                </label>
                <Input
                  type="text"
                  placeholder="$0"
                  value={fundingAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setFundingAmount(value ? `$${parseInt(value).toLocaleString()}` : "");
                  }}
                  className="bg-white dark:bg-card border-border dark:border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/90 dark:text-foreground/90">
                  Notes (Optional)
                </label>
                <Textarea
                  placeholder="Any additional notes for this request..."
                  value={fundingNotes}
                  onChange={(e) => setFundingNotes(e.target.value)}
                  className="bg-white dark:bg-card border-border dark:border-border"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedDeal(null)}
              className="border-border dark:border-border"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRequestFunding}
              disabled={!fundingAmount || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
