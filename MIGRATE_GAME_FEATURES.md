# Game Features Database Migration

To enable all the new game features, you need to run the database migration. Follow these steps:

## 1. Apply the Migration

Run the SQL migration file in your Supabase SQL editor:

```bash
# Copy the contents of:
supabase/game-features.sql
```

## 2. What This Migration Adds

### New Tables:
- **game_sessions** - Tracks game sessions with XP, streaks, and stats
- **item_decisions** - Records each swipe decision with timing and XP earned
- **achievements** - Defines all available achievements
- **user_achievements** - Tracks which achievements users have unlocked
- **leaderboard_entries** - Stores leaderboard rankings
- **containers** - Virtual containers for organizing kept items
- **game_state** - Persists game progress between sessions

### Profile Extensions:
- total_xp - Total XP earned
- level - Current player level (1-10)
- current_streak - Active decision streak
- longest_streak - Best streak achieved
- total_decisions - Total items decided
- quick_decisions - Decisions made under 3 seconds
- last_activity - Last active timestamp

### Default Achievements:
The migration includes 12 starter achievements:
- Speed achievements (quick decisions)
- Streak achievements (consecutive decisions)
- Volume achievements (total decisions)
- Special achievements (unique patterns)

## 3. Features Now Available

After running the migration, these features will be active:

1. **Swipe Mode** - Tinder-style swiping interface
2. **Game Modes** - Quick Sort, Speed Toss, Deep Sort, Free Play
3. **XP & Levels** - Earn XP for decisions, level up over time
4. **Achievements** - Unlock badges for milestones
5. **Streaks & Combos** - Build momentum for bonus XP
6. **Containers** - Organize kept items in virtual containers
7. **Leaderboards** - Compete with others (weekly/monthly/all-time)

## 4. Test the Features

1. Go to any inventory page
2. Click the "Play Game Mode" button
3. Select a game mode and start swiping!
4. Check your XP and achievements after each session

## Notes

- All RLS policies are included for security
- Indexes are created for optimal performance
- The migration is idempotent (safe to run multiple times)