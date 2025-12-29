import { act, render, screen, waitFor } from '@testing-library/react';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { world as ecsWorld } from '@/ecs/world';
import { useGameStore } from '@/stores/gameStore';
import { HUD } from '../HUD';

// Mock the ECS world
vi.mock('@/ecs/world', () => ({
    world: {
        with: vi.fn((type) => {
            if (type === 'time') {
                return {
                    entities: [
                        {
                            time: {
                                hour: 8,
                                phase: 'day',
                            },
                        },
                    ],
                    *[Symbol.iterator]() {
                        yield {
                            time: {
                                hour: 8,
                                phase: 'day',
                            },
                        };
                    },
                };
            }
            if (type === 'weather') {
                return {
                    entities: [
                        {
                            weather: {
                                current: 'clear',
                            },
                        },
                    ],
                    *[Symbol.iterator]() {
                        yield {
                            weather: {
                                current: 'clear',
                            },
                        };
                    },
                };
            }
            return {
                entities: [],
                *[Symbol.iterator]() {},
            };
        }),
    },
}));

describe('HUD Component', () => {
    beforeEach(() => {
        // Reset stores to initial state
        act(() => {
            useGameStore.setState({
                player: {
                    health: 100,
                    maxHealth: 100,
                    stamina: 100,
                    maxStamina: 100,
                    level: 1,
                    experience: 0,
                    expToNext: 1000,
                    gold: 0,
                    position: new THREE.Vector3(0, 0, 0),
                    rotation: 0,
                    speed: 0,
                    maxSpeed: 0.15,
                    verticalSpeed: 0,
                    isMoving: false,
                    isJumping: false,
                    invulnerable: false,
                    invulnerableUntil: 0,
                    damage: 10,
                    speedMultiplier: 1,
                    mana: 20,
                    maxMana: 20,
                    inventory: [],
                },
                nearbyResource: null,
                score: 0,
                distance: 0,
                settings: {
                    showHelp: true,
                },
            } as any);
        });
    });

    describe('Health and Stamina Bars', () => {
        it('should display health bar with correct percentage', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 50,
                        maxHealth: 100,
                    },
                }));
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ width: '50%' });
        });

        it('should display stamina bar with correct percentage', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        stamina: 75,
                        maxStamina: 100,
                    },
                }));
            });

            render(<HUD />);

            const staminaBar = screen.getByTestId('stamina-bar-fill');
            expect(staminaBar).toHaveStyle({ width: '75%' });
        });

        it('should change health bar color based on health level', () => {
            // High health (>50%) - green
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 60,
                        maxHealth: 100,
                    },
                }));
            });

            const { rerender } = render(<HUD />);
            let healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ background: '#22c55e' });

            // Medium health (25-50%) - yellow
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 40,
                        maxHealth: 100,
                    },
                }));
            });

            rerender(<HUD />);
            healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ background: '#fbbf24' });

            // Low health (<25%) - red
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 20,
                        maxHealth: 100,
                    },
                }));
            });

            rerender(<HUD />);
            healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ background: '#ef4444' });
        });

        it('should handle edge case of 0 health', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 0,
                        maxHealth: 100,
                    },
                }));
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ width: '0%' });
        });

        it('should handle edge case of full health', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 100,
                        maxHealth: 100,
                    },
                }));
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ width: '100%' });
        });
    });

    describe('Resource Collection Prompt', () => {
        it('should not display prompt when no resource nearby', () => {
            act(() => {
                useGameStore.setState({ nearbyResource: null });
            });

            render(<HUD />);

            expect(screen.queryByText(/Tap to collect/i)).not.toBeInTheDocument();
        });

        it('should display prompt when resource is nearby', () => {
            act(() => {
                useGameStore.setState({
                    nearbyResource: {
                        name: 'Fish',
                        icon: '🐟',
                        type: 'fish',
                    },
                });
            });

            render(<HUD />);

            expect(screen.getByText('Fish')).toBeInTheDocument();
            expect(screen.getByText(/collect/i)).toBeInTheDocument();
            expect(screen.getByText('🐟')).toBeInTheDocument();
        });

        it('should display correct icon for berries', () => {
            act(() => {
                useGameStore.setState({
                    nearbyResource: {
                        name: 'Berries',
                        icon: '🫐',
                        type: 'berries',
                    },
                });
            });

            render(<HUD />);

            expect(screen.getByText('Berries')).toBeInTheDocument();
            expect(screen.getByText('🫐')).toBeInTheDocument();
        });

        it('should display correct icon for water', () => {
            act(() => {
                useGameStore.setState({
                    nearbyResource: {
                        name: 'Water',
                        icon: '💧',
                        type: 'water',
                    },
                });
            });

            render(<HUD />);

            expect(screen.getByText('Water')).toBeInTheDocument();
            expect(screen.getByText('💧')).toBeInTheDocument();
        });

        it('should hide prompt when resource is collected', async () => {
            act(() => {
                useGameStore.setState({
                    nearbyResource: {
                        name: 'Fish',
                        icon: '🐟',
                        type: 'fish',
                    },
                });
            });

            const { rerender } = render(<HUD />);
            expect(screen.getByText('Fish')).toBeInTheDocument();

            // Resource collected
            act(() => {
                useGameStore.setState({ nearbyResource: null });
            });
            rerender(<HUD />);

            expect(screen.queryByText('Fish')).not.toBeInTheDocument();
        });
    });

    describe('Time Display', () => {
        it('should display time in correct format', () => {
            render(<HUD />);

            // Should show "8:00 AM - Day" based on mocked time
            expect(screen.getByText(/8:00 AM - Day/i)).toBeInTheDocument();
        });

        it('should format PM times correctly', async () => {
            // Mock afternoon time
            vi.mocked(ecsWorld.with).mockReturnValue({
                *[Symbol.iterator]() {
                    yield {
                        time: {
                            hour: 14,
                            phase: 'day',
                        },
                    };
                },
            } as any);

            render(<HUD />);

            // Wait for state update (interval is 100ms)
            await waitFor(
                () => {
                    expect(screen.getByText(/2:00 PM - Day/i)).toBeInTheDocument();
                },
                { timeout: 1500 }
            );
        });

        it('should capitalize phase names', () => {
            render(<HUD />);

            // Should capitalize "day" to "Day"
            expect(screen.getByText(/Day/)).toBeInTheDocument();
        });

        it('should handle midnight (hour 0) as 12 AM', async () => {
            vi.mocked(ecsWorld.with).mockReturnValue({
                *[Symbol.iterator]() {
                    yield {
                        time: {
                            hour: 0,
                            phase: 'night',
                        },
                    };
                },
            } as any);

            render(<HUD />);

            await waitFor(
                () => {
                    expect(screen.getByText(/12:00 AM - Night/i)).toBeInTheDocument();
                },
                { timeout: 1500 }
            );
        });

        it('should handle noon (hour 12) as 12 PM', async () => {
            vi.mocked(ecsWorld.with).mockReturnValue({
                *[Symbol.iterator]() {
                    yield {
                        time: {
                            hour: 12,
                            phase: 'day',
                        },
                    };
                },
            } as any);

            render(<HUD />);

            await waitFor(
                () => {
                    expect(screen.getByText(/12:00 PM - Day/i)).toBeInTheDocument();
                },
                { timeout: 1500 }
            );
        });
    });

    describe('Danger Vignette', () => {
        it('should not show vignette when health is above 30%', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 50,
                        maxHealth: 100,
                    },
                }));
            });

            const { container } = render(<HUD />);

            // Check for vignette element (radial-gradient)
            const vignette = container.querySelector('[style*="radial-gradient"]');
            expect(vignette).not.toBeInTheDocument();
        });

        it('should show vignette when health is below 30%', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 25,
                        maxHealth: 100,
                    },
                }));
            });

            const { container } = render(<HUD />);

            // Check for vignette element
            const vignette = container.querySelector('[style*="radial-gradient"]');
            expect(vignette).toBeInTheDocument();
        });

        it('should show vignette at exactly 29% health', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 29,
                        maxHealth: 100,
                    },
                }));
            });

            const { container } = render(<HUD />);

            const vignette = container.querySelector('[style*="radial-gradient"]');
            expect(vignette).toBeInTheDocument();
        });

        it('should not show vignette at exactly 30% health', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 30,
                        maxHealth: 100,
                    },
                }));
            });

            const { container } = render(<HUD />);

            const vignette = container.querySelector('[style*="radial-gradient"]');
            expect(vignette).not.toBeInTheDocument();
        });
    });

    describe('Pause Menu', () => {
        it('should not show pause menu by default', () => {
            render(<HUD />);

            expect(screen.queryByText('PAUSED')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle maxHealth of 0 gracefully', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 0,
                        maxHealth: 0,
                    },
                }));
            });

            render(<HUD />);

            // Should not crash
            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toBeInTheDocument();
        });

        it('should handle negative health gracefully', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: -10,
                        maxHealth: 100,
                    },
                }));
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toBeInTheDocument();
            expect(healthBar).toHaveStyle({ width: '0%' });
        });

        it('should handle health exceeding maxHealth', () => {
            act(() => {
                useGameStore.setState((state) => ({
                    player: {
                        ...state.player,
                        health: 150,
                        maxHealth: 100,
                    },
                }));
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            // Should cap at 100%
            expect(healthBar).toHaveStyle({ width: '100%' });
        });
    });
});
