import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Pressable,
  TextInput,
} from "react-native";
import PageHeader from "@/src/components/PageHeader";
import { useTheme } from "@/src/hooks/useTheme";
import { getNotifications, type AppNotification } from "@/src/services/notifications";
import Skeleton from "@/src/components/Skeleton";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search, date filter and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  const loadNotifications = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const dateParam = selectedDate ? selectedDate.toISOString().split("T")[0] : undefined;
      const data = await getNotifications({
        search: searchQuery || undefined,
        date: dateParam,
      });
      setNotifications(data);
    } catch (error) {
      console.warn("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedDate]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(() => {
    // Reset filters on pull-to-refresh
    setSearchQuery("");
    setSelectedDate(null);
    setPage(1);
    loadNotifications(true);
  }, [loadNotifications]);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setOpenDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setPage(1);
    }
  };

  // Real-time client-side filter
  const filteredNotifications = notifications.filter((notification) => {
    // Search query matching title or body
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = notification.title.toLowerCase().includes(q);
      const matchBody = notification.body.toLowerCase().includes(q);
      if (!matchTitle && !matchBody) return false;
    }

    // Date matching (comparing YYYY-MM-DD from createdAt date string)
    if (selectedDate && notification.createdAt) {
      const itemDate = new Date(notification.createdAt);
      const isSameDay =
        itemDate.getFullYear() === selectedDate.getFullYear() &&
        itemDate.getMonth() === selectedDate.getMonth() &&
        itemDate.getDate() === selectedDate.getDate();
      if (!isSameDay) return false;
    }

    return true;
  });

  const paginatedNotifications = filteredNotifications.slice(0, page * limit);
  const hasMore = filteredNotifications.length > page * limit;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <PageHeader title="Notifications" />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <Text style={[styles.sectionIntro, { color: colors.textSecondary }]}>
          Stay on top of invoice activity, reminders, and payment events without leaving the app.
        </Text>

        {/* Search and Date Filter Bar */}
        <View style={styles.filterRow}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search notifications..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setPage(1);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                hitSlop={8}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => {
              if (selectedDate) {
                setSelectedDate(null);
                setPage(1);
              } else {
                setOpenDatePicker(true);
              }
            }}
            style={({ pressed }) => [
              styles.dateButton,
              {
                backgroundColor: selectedDate ? colors.tint + "12" : colors.surface,
                borderColor: selectedDate ? colors.tint : colors.border,
                borderWidth: 1,
                opacity: pressed ? 0.8 : 1,
              }
            ]}
          >
            <Ionicons
              name={selectedDate ? "calendar" : "calendar-outline"}
              size={18}
              color={selectedDate ? colors.tint : colors.textSecondary}
            />
            <Text style={[styles.dateButtonText, { color: selectedDate ? colors.tint : colors.textSecondary }]}>
              {selectedDate
                ? selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                : "Date"}
            </Text>
            {selectedDate && (
              <Ionicons name="close-circle" size={14} color={colors.tint} style={styles.clearDateIcon} />
            )}
          </Pressable>
        </View>

        {openDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Notification List or State views */}
        {isLoading && !isRefreshing ? (
          <View style={styles.list}>
            {[1, 2, 3].map((key) => (
              <View key={key} style={[styles.card, { backgroundColor: colors.surface }]}>
                <Skeleton width={42} height={42} borderRadius={21} />
                <View style={[styles.cardCopy, { gap: 6 }]}>
                  <Skeleton width="50%" height={16} />
                  <Skeleton width="90%" height={14} />
                  <Skeleton width="20%" height={12} />
                </View>
              </View>
            ))}
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.tint + "16" }]}>
              <Ionicons name="notifications-off-outline" size={36} color={colors.tint} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications found</Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
              Try adjusting your search query or selected date filters.
            </Text>
            {(searchQuery.length > 0 || selectedDate !== null) && (
              <Pressable
                onPress={() => {
                  setSearchQuery("");
                  setSelectedDate(null);
                  setPage(1);
                }}
                style={({ pressed }) => [
                  styles.clearAllBtn,
                  {
                    backgroundColor: colors.tint,
                    opacity: pressed ? 0.9 : 1,
                  }
                ]}
              >
                <Text style={styles.clearAllText}>Clear all filters</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {paginatedNotifications.map((notification) => (
              <View key={notification.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={[styles.iconWrap, { backgroundColor: `${notification.tint}16` }]}>
                  <Ionicons name={notification.icon} size={20} color={notification.tint} />
                </View>
                <View style={styles.cardCopy}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{notification.title}</Text>
                    {notification.read === false && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />
                    )}
                  </View>
                  <Text style={[styles.cardBody, { color: colors.textSecondary }]}>{notification.body}</Text>
                  <Text style={[styles.cardTime, { color: colors.textMuted }]}>{notification.time}</Text>
                </View>
              </View>
            ))}

            {hasMore && (
              <Pressable
                onPress={() => setPage((p) => p + 1)}
                style={({ pressed }) => [
                  styles.loadMoreButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
              >
                <Text style={[styles.loadMoreText, { color: colors.tint }]}>Load More</Text>
                <Ionicons name="chevron-down" size={16} color={colors.tint} style={styles.loadMoreIcon} />
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionIntro: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    marginLeft: 8,
  },
  clearSearchButton: {
    padding: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    gap: 6,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  clearDateIcon: {
    marginLeft: 2,
  },
  list: {
    gap: 14,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 280,
  },
  clearAllBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  clearAllText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    marginTop: 10,
    gap: 6,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: "700",
  },
  loadMoreIcon: {
    marginLeft: 2,
  },
});
