"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { updateFundingStatus, type FundingStatus } from "@/lib/actions/investor-actions";

interface FundingRequest {
  id: string;
  deal_id: string;
  investor_id: string;
  requested_amount: number;
  approved_amount: number | null;
  funded_amount: number | null;
  status: string;
  notes: string | null;
  requested_at: string;
  approved_at: string | null;
  funded_at: string | null;
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
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface FundingManagementClientProps {
  requests: FundingRequest[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  under_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  funded: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  withdrawn: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  under_review: <Eye className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  funded: <DollarSign className="h-3 w-3" />,
  declined: <XCircle className="h-3 w-3" />,
  withdrawn: <AlertCircle className="h-3 w-3" />,
};

export function FundingManagementClient({ requests }: FundingManagementClientProps) {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<FundingRequest | null>(null);
  const [newStatus, setNewStatus] = useState<FundingStatus>("pending");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredRequests = filterStatus === "all" 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    underReview: requests.filter(r => r.status === "under_review").length,
    approved: requests.filter(r => r.status === "approved").length,
    funded: requests.filter(r => r.status === "funded").length,
    totalRequested: requests.reduce((sum, r) => sum + r.requested_amount, 0),
    totalFunded: requests
      .filter(r => r.status === "funded")
      .reduce((sum, r) => sum + (r.funded_amount || 0), 0),
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    
    const amount = approvedAmount 
      ? parseFloat(approvedAmount.replace(/[^0-9.]/g, "")) 
      : undefined;
    
    const result = await updateFundingStatus(
      selectedRequest.id,
      newStatus,
      newStatus === "approved" ? amount : undefined,
      newStatus === "funded" ? amount : undefined
    );
    
    if (result.error) {
      toast.error("Failed to update", { description: result.error });
    } else {
      toast.success("Status updated successfully");
      setSelectedRequest(null);
      setApprovedAmount("");
      router.refresh();
    }
    
    setIsSubmitting(false);
  };

  const openUpdateDialog = (request: FundingRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status as FundingStatus);
    setApprovedAmount(
      request.approved_amount 
        ? `$${request.approved_amount.toLocaleString()}` 
        : `$${request.requested_amount.toLocaleString()}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending + stats.underReview}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.approved}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Requested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(stats.totalRequested)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Funded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats.totalFunded)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">All Requests</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                {filteredRequests.length} funding requests
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No funding requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700">
                  <TableHead className="text-slate-600 dark:text-slate-400">Property</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Investor</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400 text-right">Requested</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="border-slate-200 dark:border-slate-700">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {request.deals?.properties?.address || "—"}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {request.deals?.properties?.city}, {request.deals?.properties?.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {request.profiles?.full_name || "—"}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {request.profiles?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatCurrency(request.requested_amount)}
                        </p>
                        {request.approved_amount && (
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            Approved: {formatCurrency(request.approved_amount)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[request.status]}>
                        <span className="flex items-center gap-1">
                          {statusIcons[request.status]}
                          {request.status.replace("_", " ")}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {!["funded", "declined", "withdrawn"].includes(request.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateDialog(request)}
                          className="border-slate-200 dark:border-slate-700"
                        >
                          Update
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

      {/* Update Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Update Funding Request</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Change the status of this funding request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="font-medium text-slate-900 dark:text-white">
                  {selectedRequest.deals?.properties?.address}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Investor: {selectedRequest.profiles?.full_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Requested: {formatCurrency(selectedRequest.requested_amount)}
                </p>
                {selectedRequest.notes && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">
                    &quot;{selectedRequest.notes}&quot;
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  New Status
                </label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as FundingStatus)}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="funded">Funded</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newStatus === "approved" || newStatus === "funded") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {newStatus === "approved" ? "Approved Amount" : "Funded Amount"}
                  </label>
                  <Input
                    type="text"
                    value={approvedAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setApprovedAmount(value ? `$${parseInt(value).toLocaleString()}` : "");
                    }}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedRequest(null)}
              className="border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
