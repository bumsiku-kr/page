'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Category, CategoryRequest } from '@/types/blog';
import DataTable from '@/components/ui/DataTable';
import { formatDate } from '@/lib/utils';

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 새 카테고리 및 수정 상태
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryOrder, setCategoryOrder] = useState(0);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.categories.getList();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('카테고리를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }

    try {
      const newCategory: CategoryRequest = {
        name: categoryName.trim(),
        orderNum: categoryOrder,
      };
      
      await api.categories.create(newCategory);
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('카테고리 생성 중 오류 발생:', err);
      alert('카테고리를 생성하는 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }

    try {
      const updatedCategory: CategoryRequest = {
        name: categoryName.trim(),
        orderNum: categoryOrder,
      };
      
      await api.categories.update(editingCategory.id, updatedCategory);
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('카테고리 수정 중 오류 발생:', err);
      alert('카테고리를 수정하는 중 오류가 발생했습니다.');
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryOrder(category.order);
    setIsEditMode(true);
    setIsAddMode(false);
  };

  const resetForm = () => {
    setIsAddMode(false);
    setIsEditMode(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryOrder(0);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'name',
      label: '카테고리명',
    },
    {
      key: 'order',
      label: '순서',
    },
    {
      key: 'postCount',
      label: '게시글 수',
    },
    {
      key: 'createdAt',
      label: '생성일',
      render: (category: Category) => formatDate(category.createdAt),
    },
    {
      key: 'actions',
      label: '관리',
      render: (category: Category) => (
        <button
          onClick={() => startEditing(category)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          수정
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">카테고리 관리</h1>
        
        {/* 카테고리 추가/수정 폼 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">
            {isEditMode ? '카테고리 수정' : '새 카테고리 추가'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                카테고리명
              </label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="카테고리명 입력"
              />
            </div>
            
            <div>
              <label htmlFor="categoryOrder" className="block text-sm font-medium text-gray-700 mb-1">
                표시 순서
              </label>
              <input
                type="number"
                id="categoryOrder"
                value={categoryOrder}
                onChange={(e) => setCategoryOrder(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min="0"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            {isEditMode && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
            )}
            
            <button
              onClick={isEditMode ? handleUpdateCategory : handleCreateCategory}
              className={`px-4 py-2 ${
                isEditMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
              } text-white rounded`}
            >
              {isEditMode ? '수정' : '추가'}
            </button>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={categories} 
        isLoading={isLoading} 
        error={error} 
      />
    </div>
  );
} 