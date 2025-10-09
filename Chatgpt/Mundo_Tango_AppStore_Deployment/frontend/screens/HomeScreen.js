import React from 'react';
import { View, ScrollView } from 'react-native';
import MomentsFeed from '../components/MomentsFeed';
import EventExplorer from '../components/EventExplorer';
import ProfileView from '../components/ProfileView';
export default function HomeScreen(){
  return (<ScrollView style={{ padding: 16 }}>
    <MomentsFeed />
    <EventExplorer />
    <ProfileView />
  </ScrollView>);
}