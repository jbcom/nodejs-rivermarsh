import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Tutorial } from '../Tutorial';

const TUTORIAL_STORAGE_KEY = 'rivermarsh_tutorial_completed';

describe('Tutorial', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('First Launch', () => {
        it('should show tutorial on first launch', () => {
            render(<Tutorial />);
            expect(screen.getByText('Movement')).toBeInTheDocument();
        });

        it('should not show tutorial if already completed', () => {
            localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
            render(<Tutorial />);
            expect(screen.queryByText('Movement')).not.toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should advance to next step when clicking Next', () => {
            render(<Tutorial />);
            const nextButton = screen.getByLabelText('Next step');
            fireEvent.click(nextButton);
            expect(screen.getByText('Jump')).toBeInTheDocument();
        });

        it('should show "Start Playing" on last step', () => {
            render(<Tutorial />);
            const nextButton = screen.getByLabelText('Next step');
            
            // Advance to last step (total 4 steps)
            fireEvent.click(nextButton); // Step 2: Jump
            fireEvent.click(screen.getByLabelText('Next step')); // Step 3: Collect
            fireEvent.click(screen.getByLabelText('Next step')); // Step 4: Survive
            
            expect(screen.getByText('Start Playing')).toBeInTheDocument();
        });
    });

    describe('Skip Functionality', () => {
        it('should close tutorial when clicking Skip', () => {
            render(<Tutorial />);
            const skipButton = screen.getByLabelText('Skip tutorial');
            fireEvent.click(skipButton);
            expect(screen.queryByText('Movement')).not.toBeInTheDocument();
        });

        it('should mark tutorial as completed when skipped', () => {
            render(<Tutorial />);
            const skipButton = screen.getByLabelText('Skip tutorial');
            fireEvent.click(skipButton);
            expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('true');
        });
    });

    describe('Completion', () => {
        it('should close tutorial when finishing all steps', () => {
            render(<Tutorial />);
            
            // Advance to last step
            fireEvent.click(screen.getByLabelText('Next step'));
            fireEvent.click(screen.getByLabelText('Next step'));
            fireEvent.click(screen.getByLabelText('Next step'));
            
            const startButton = screen.getByLabelText('Start playing');
            fireEvent.click(startButton);
            
            expect(screen.queryByText('Survival')).not.toBeInTheDocument();
        });

        it('should mark tutorial as completed when finished', () => {
            render(<Tutorial />);
            
            // Advance to last step
            fireEvent.click(screen.getByLabelText('Next step'));
            fireEvent.click(screen.getByLabelText('Next step'));
            fireEvent.click(screen.getByLabelText('Next step'));
            
            const startButton = screen.getByLabelText('Start playing');
            fireEvent.click(startButton);
            
            expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('true');
        });
    });

    describe('Edge Cases', () => {
        it('should handle localStorage errors gracefully', () => {
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Storage full');
            });
            
            render(<Tutorial />);
            const skipButton = screen.getByLabelText('Skip tutorial');
            
            // Should still close even if saving fails
            fireEvent.click(skipButton);
            expect(screen.queryByText('Movement')).not.toBeInTheDocument();
        });
    });
});
