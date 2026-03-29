import { useState, createContext, useContext } from 'react';

export const initialMembers = [
  {
    id: 'me',
    name: '나 (Me)',
    birth: '1990-05-14',
    relation: 'me',
    gender: 'male',
    alive: true,
    avatar: null,
  },
  {
    id: 'father',
    name: '아버지',
    birth: '1962-03-22',
    relation: 'parent',
    gender: 'male',
    alive: true,
    avatar: null,
  },
  {
    id: 'mother',
    name: '어머니',
    birth: '1965-08-10',
    relation: 'parent',
    gender: 'female',
    alive: true,
    avatar: null,
  },
  {
    id: 'sibling1',
    name: '형 / 오빠',
    birth: '1988-01-30',
    relation: 'sibling',
    gender: 'male',
    alive: true,
    avatar: null,
  },
  {
    id: 'child1',
    name: '아이',
    birth: '2018-11-05',
    relation: 'child',
    gender: 'female',
    alive: true,
    avatar: null,
  },
];

export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}
