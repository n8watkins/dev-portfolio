/**
 * Grid Items - Deprecated Entry Point
 *
 * This file has been refactored. Grid items are now in separate files under data/grid/items/
 * This file is kept for backward compatibility and simply re-exports from the new location.
 *
 * REFACTORING BENEFITS:
 * - Reduced from 289 lines to 15 lines (95% reduction)
 * - Each grid item in its own file for better organization
 * - Easier to find and modify specific items
 * - Better Git diffs (changes to one item don't affect others)
 * - Individual imports possible: import { gridItem1 } from '@/data/grid/items'
 */

export { gridItems, gridItem2, gridItem3, gridItem4, gridItem5, gridItem6 } from './items'
