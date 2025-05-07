'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Category } from '../../types';
import type { Identifier, XYCoord } from 'dnd-core';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// 드래그 앤 드롭을 위한 아이템 타입
const CATEGORY_ITEM_TYPE = 'category';

// 드래그 아이템 인터페이스
interface DragItem {
  index: number;
  id: string;
  type: string;
}

// 드래그 가능한 카테고리 아이템 컴포넌트
interface CategoryItemProps {
  category: Category;
  index: number;
  moveCategory: (fromIndex: number, toIndex: number) => void;
  handleEdit: (category: Category) => void;
}

const CategoryItem = ({ category, index, moveCategory, handleEdit }: CategoryItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // 드래그 설정
  const [{ isDragging }, drag] = useDrag({
    type: CATEGORY_ITEM_TYPE,
    item: () => {
      return { index, id: category.name, type: CATEGORY_ITEM_TYPE }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // 드롭 설정
  const [, drop] = useDrop({
    accept: CATEGORY_ITEM_TYPE,
    hover: (item: DragItem, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // 자기 자신에게 드롭하는 경우 무시
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // 호버링 중인 아이템의 위치 계산
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset ? clientOffset.y - hoverBoundingRect.top : 0;
      
      // 드래그 방향에 따라 이동 여부 결정
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // 실제 이동 수행
      moveCategory(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  // 드래그와 드롭 ref 연결
  drag(drop(ref));
  
  return (
    <div
      ref={ref}
      className={`p-4 mb-2 border rounded-md cursor-move ${
        isDragging ? 'opacity-50 bg-gray-100' : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <span className="text-gray-900 font-medium">{category.name}</span>
          <span className="ml-2 text-gray-500 text-sm">순서: {category.order}</span>
        </div>
        <button
          onClick={() => handleEdit(category)}
          className="text-blue-600 hover:text-blue-900"
        >
          편집
        </button>
      </div>
    </div>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 카테고리 데이터 로드
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const categories = await api.categories.getList();
      
      // 순서대로 정렬
      const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
      setCategories(sortedCategories);
    } catch (err) {
      setError('카테고리를 불러오는 중 오류가 발생했습니다.');
      console.error('카테고리 목록 가져오기 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 카테고리 순서 변경 처리
  const moveCategory = (fromIndex: number, toIndex: number) => {
    const updatedCategories = [...categories];
    const [movedCategory] = updatedCategories.splice(fromIndex, 1);
    updatedCategories.splice(toIndex, 0, movedCategory);
    
    // 순서 업데이트
    const reorderedCategories = updatedCategories.map((cat, index) => ({
      ...cat,
      order: index + 1, // 1부터 시작하는 순서
    }));
    
    setCategories(reorderedCategories);
  };
  
  // 카테고리 편집 모달 열기
  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setCategoryName(category.name);
    setIsModalOpen(true);
  };
  
  // 새 카테고리 추가 모달 열기
  const handleAddNew = () => {
    setEditCategory(null);
    setCategoryName('');
    setIsModalOpen(true);
  };
  
  // 변경사항 저장
  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      
      // 모든 카테고리의 순서 업데이트
      for (const category of categories) {
        await api.categories.update(category.id, {
          name: category.name,
          orderNum: category.order
        });
      }
      
      alert('카테고리 순서가 저장되었습니다.');
    } catch (err) {
      setError('변경사항을 저장하는 중 오류가 발생했습니다.');
      console.error('카테고리 업데이트 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 카테고리 저장 (추가 또는 편집)
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 기존 카테고리 편집
      if (editCategory) {
        await api.categories.update(editCategory.id, {
          name: categoryName,
          orderNum: editCategory.order
        });
      } else {
        // 새 카테고리 추가
        await api.categories.create({
          name: categoryName,
          orderNum: categories.length + 1
        });
      }
      
      // 카테고리 목록 새로고침
      await fetchCategories();
      setIsModalOpen(false);
      setCategoryName('');
      setEditCategory(null);
    } catch (err) {
      setError('카테고리를 저장하는 중 오류가 발생했습니다.');
      console.error('카테고리 저장 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">카테고리 관리</h1>
          <div className="space-x-4">
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isSubmitting}
            >
              새 카테고리
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={isSubmitting}
            >
              순서 저장
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {categories.length === 0 ? (
            <p className="text-center text-gray-500">등록된 카테고리가 없습니다.</p>
          ) : (
            categories.map((category, index) => (
              <CategoryItem
                key={category.name}
                category={category}
                index={index}
                moveCategory={moveCategory}
                handleEdit={handleEdit}
              />
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">
                {editCategory ? '카테고리 편집' : '새 카테고리'}
              </h2>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                placeholder="카테고리 이름"
                disabled={isSubmitting}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
} 