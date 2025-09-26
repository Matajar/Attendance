import React, { useState, useEffect } from 'react';
import { designationAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { MoreHorizontal, Plus, Pencil, Trash2, Award } from 'lucide-react';

export const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 1
  });

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const response = await designationAPI.getAll();
      setDesignations(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch designations');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch designations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add level field with default value
      const payload = {
        ...formData,
        level: formData.level || 1
      };

      if (editingDesignation) {
        const response = await designationAPI.update(editingDesignation._id || editingDesignation.id, payload);
        toast({
          title: 'Success',
          description: response.data.message || 'Designation updated successfully',
        });
      } else {
        const response = await designationAPI.create(payload);
        toast({
          title: 'Success',
          description: response.data.message || 'Designation created successfully',
        });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchDesignations();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || `Failed to ${editingDesignation ? 'update' : 'create'} designation`,
        variant: 'destructive',
      });
      // Don't close dialog on error
    }
  };

  const handleEdit = (designation) => {
    setEditingDesignation(designation);
    setFormData({
      name: designation.name,
      description: designation.description || '',
      level: designation.level || 1
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      try {
        const response = await designationAPI.delete(id);
        toast({
          title: 'Success',
          description: response.data.message || 'Designation deleted successfully',
        });
        fetchDesignations();
      } catch (err) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete designation',
          variant: 'destructive',
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setEditingDesignation(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading designations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={fetchDesignations} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8" />
            Designation Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your organization's job designations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Designation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDesignation ? 'Edit Designation' : 'Add New Designation'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Designation Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter designation name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter designation description (optional)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDesignation ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Designations ({designations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {designations.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No designations found</p>
              <p className="text-sm text-gray-400">Add your first designation to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {designations.map((designation) => (
                    <TableRow key={designation._id || designation.id}>
                      <TableCell className="font-medium">{designation.name}</TableCell>
                      <TableCell>
                        {designation.description ? (
                          <span className="text-gray-700">{designation.description}</span>
                        ) : (
                          <span className="text-gray-400 italic">No description</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {designation.created_at ? formatDate(designation.created_at) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(designation)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(designation._id || designation.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

