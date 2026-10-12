'use client';

import { useMemo, useState } from 'react';
import HistoryFilters from './_components/HistoryFilters';
import HistoryKpiBento from './_components/HistoryKpiBento';
import HistoryPageHeader from './_components/HistoryPageHeader';
import HistoryPagination from './_components/HistoryPagination';
import HistoryStorageBanner from './_components/HistoryStorageBanner';
import HistoryTable from './_components/HistoryTable';
import HistoryTopBar from './_components/HistoryTopBar';
import { CategoryFilterType, ExamModeType, HistoryAttempt, SkillType, StatusFilterType } from './types';
import { MOCK_ATTEMPTS } from './utils';

export default function HistoryPage() {
    const [selectedSkill, setSelectedSkill] = useState<SkillType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMode, setSelectedMode] = useState<ExamModeType>('all');
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('all');
    const [selectedStatus, setSelectedStatus] = useState<StatusFilterType>('all');
    const [selectedDateScope, setSelectedDateScope] = useState('7d');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const handleResetFilters = () => {
        setSelectedSkill('all');
        setSearchQuery('');
        setSelectedMode('all');
        setSelectedCategory('all');
        setSelectedStatus('all');
        setSelectedDateScope('7d');
        setCurrentPage(1);
    };

    // Filter attempts
    const filteredAttempts = useMemo(() => {
        return MOCK_ATTEMPTS.filter((item) => {
            // Filter by skill
            if (selectedSkill !== 'all' && item.skill !== selectedSkill) {
                return false;
            }

            // Filter by search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchCode = item.code.toLowerCase().includes(q);
                const matchTitle = item.title.toLowerCase().includes(q);
                const matchTopic = item.topic.toLowerCase().includes(q);
                if (!matchCode && !matchTitle && !matchTopic) {
                    return false;
                }
            }

            // Filter by mode
            if (selectedMode !== 'all' && item.modeType !== selectedMode) {
                return false;
            }

            // Filter by status
            if (selectedStatus !== 'all') {
                if (selectedStatus === 'completed' && (item.isPendingRow || item.isWarningRow)) {
                    return false;
                }
                if (selectedStatus === 'scoring' && !item.scoreInfo.isScoring) {
                    return false;
                }
                if (selectedStatus === 'sync_pending' && item.storage !== 'sync_pending') {
                    return false;
                }
                if (selectedStatus === 'interrupted' && !item.scoreInfo.isInterrupted) {
                    return false;
                }
            }

            // Filter by category
            if (selectedCategory !== 'all') {
                if (selectedCategory === 'fresh' && !item.categoryBadge.includes('chưa gặp')) {
                    return false;
                }
                if (selectedCategory === 'retake' && !item.categoryBadge.includes('Làm lại')) {
                    return false;
                }
                if (selectedCategory === 'sample_viewed' && !item.hasSampleViewed) {
                    return false;
                }
                if (selectedCategory === 'independent' && item.hasSampleViewed) {
                    return false;
                }
            }

            return true;
        });
    }, [selectedSkill, searchQuery, selectedMode, selectedStatus, selectedCategory]);

    const handleActionClick = (attempt: HistoryAttempt) => {
        // Handle attempt action (e.g. view details, resume test, check score)
        console.info('Attempt action triggered:', attempt.code, attempt.actionText);
    };

    return (
        <div className="-mx-8 -mt-4 min-h-screen bg-background">
            {/* Top Bar Navigation */}
            <HistoryTopBar />

            {/* Main Content Stream */}
            <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 sm:px-8">
                {/* Header & Title */}
                <HistoryPageHeader />

                {/* KPI Metrics Bento Grid */}
                <HistoryKpiBento />

                {/* Filter & Precision Search Suite */}
                <HistoryFilters
                    selectedSkill={selectedSkill}
                    onSkillChange={setSelectedSkill}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedMode={selectedMode}
                    onModeChange={setSelectedMode}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    selectedDateScope={selectedDateScope}
                    onDateScopeChange={setSelectedDateScope}
                    displayedCount={filteredAttempts.length}
                    totalCount={28}
                    onResetFilters={handleResetFilters}
                />

                {/* Precision Structured Attempts Table with Pagination */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                    <HistoryTable attempts={filteredAttempts} onActionClick={handleActionClick} />
                    <HistoryPagination
                        currentPage={currentPage}
                        totalPages={3}
                        totalRecords={28}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>

                {/* Offline Storage & Privacy Operations Banner */}
                <HistoryStorageBanner />
            </main>
        </div>
    );
}
