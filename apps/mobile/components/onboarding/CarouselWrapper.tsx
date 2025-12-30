import React, { forwardRef } from 'react';
import {
  FlatList,
  ScrollView,
  Platform,
  View,
  type FlatListProps,
  type NativeSyntheticEvent,
  type NativeScrollEvent
} from 'react-native';

interface CarouselWrapperProps extends Omit<FlatListProps<any>, 'renderItem'> {
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactElement;
  onScrollUpdate?: (offsetX: number) => void;
}

export const CarouselWrapper = forwardRef<FlatList, CarouselWrapperProps>(
  (props, ref) => {
    const {
      data,
      renderItem,
      onScroll,
      onScrollUpdate,
      horizontal,
      pagingEnabled,
      showsHorizontalScrollIndicator,
      bounces,
      keyExtractor,
      onViewableItemsChanged,
      viewabilityConfig,
      ...otherProps
    } = props;

    if (Platform.OS === 'web') {
      const handleWebScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Call the original onScroll handler if provided
        if (onScroll) {
          onScroll(event);
        }

        // Call the update handler for tracking current slide
        if (onScrollUpdate) {
          const offsetX = event.nativeEvent.contentOffset.x;
          onScrollUpdate(offsetX);
        }
      };

      return (
        <ScrollView
          ref={ref as any}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={handleWebScroll}
          style={{
            // @ts-ignore - CSS properties for web scroll-snap
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
          contentContainerStyle={{
            flexDirection: 'row',
          }}
        >
          {data?.map((item, index) => (
            <View
              key={keyExtractor?.(item, index) || index}
              style={{
                // @ts-ignore - CSS properties for web scroll-snap
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
              }}
            >
              {renderItem({ item, index })}
            </View>
          ))}
        </ScrollView>
      );
    }

    // Native platforms use FlatList with pagingEnabled
    return (
      <FlatList
        ref={ref}
        data={data}
        renderItem={renderItem}
        horizontal={horizontal}
        pagingEnabled={pagingEnabled}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        bounces={bounces}
        onScroll={onScroll}
        keyExtractor={keyExtractor}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        {...otherProps}
      />
    );
  }
);

CarouselWrapper.displayName = 'CarouselWrapper';
