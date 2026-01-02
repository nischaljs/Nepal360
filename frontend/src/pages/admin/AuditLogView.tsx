import { useState, useEffect } from "react";
import { getAuditLogs, type GetAuditLogsFilter } from "@/services/admin.auditLog.service";
import type { AuditLog } from "@/types/auditLog.types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const AuditLogView = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<GetAuditLogsFilter>({});

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs(filters);
      setLogs(data);
    } catch (error) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Audit Logs</h1>
      <form onSubmit={handleFilterSubmit} className="flex items-center space-x-2 mb-4">
        <Input name="actorId" placeholder="Actor ID" value={filters.actorId || ''} onChange={handleFilterChange} />
        <Input name="actionType" placeholder="Action Type" value={filters.actionType || ''} onChange={handleFilterChange} />
        <Input name="targetType" placeholder="Target Type" value={filters.targetType || ''} onChange={handleFilterChange} />
        <Button type="submit">Filter</Button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.actor?.name || log.actorId}</TableCell>
                <TableCell>{log.actionType}</TableCell>
                <TableCell>{log.targetType}: {log.targetId}</TableCell>
                <TableCell>{log.note}</TableCell>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AuditLogView;

