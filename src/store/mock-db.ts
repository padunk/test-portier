import { create } from 'zustand'
import type { User, Door, Key } from '../shared/types/domain'

interface MockDbState {
  users: User[]
  doors: Door[]
  keys: Key[]
  applyChanges: (changes: { fieldName: string, changeType: string, newValue: string | null }[]) => void
}

export const useMockDb = create<MockDbState>((set) => ({
  users: [
    {
      id: 'usr_1',
      name: 'Charlie B.',
      email: 'bob.old@corp.com',
      phone: '+6590001111',
      role: 'guest',
      status: 'suspended',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  doors: [
    {
      id: 'door_1',
      name: 'Main Entrance',
      location: 'HQ',
      device_id: 'dev_123',
      status: 'online',
      battery_level: 90,
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
  ],
  keys: [
    {
      id: 'key_1',
      user_id: 'usr_1',
      door_id: 'door_1',
      key_type: 'temporary',
      access_start: new Date().toISOString(),
      access_end: '2026-03-31T18:00:00Z',
      status: 'active',
      created_at: new Date().toISOString(),
    }
  ],
  applyChanges: (changes) => set((state) => {
    const newUsers = [...state.users]
    const newDoors = [...state.doors]
    const newKeys = [...state.keys]

    for (const change of changes) {
      const [entityType, property] = change.fieldName.split('.')
      
      if (change.changeType === 'ADD' && property === 'id') {
        if (entityType === 'user') {
          newUsers.push({
            id: change.newValue || 'new_usr',
            name: 'New User',
            email: 'new@example.com',
            phone: '',
            role: 'user',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } else if (entityType === 'door') {
          newDoors.push({
            id: change.newValue || 'new_door',
            name: 'New Door',
            location: '',
            device_id: '',
            status: 'online',
            battery_level: 100,
            last_seen: new Date().toISOString(),
            created_at: new Date().toISOString(),
          })
        } else if (entityType === 'key') {
          newKeys.push({
            id: change.newValue || 'new_key',
            user_id: 'usr_1',
            door_id: 'door_1',
            key_type: 'temporary',
            access_start: new Date().toISOString(),
            access_end: new Date().toISOString(),
            status: 'active',
            created_at: new Date().toISOString(),
          })
        }
      } else if (change.changeType === 'UPDATE') {
        if (entityType === 'user' && newUsers.length > 0) {
          newUsers[0] = { ...newUsers[0], [property]: change.newValue }
        } else if (entityType === 'door' && newDoors.length > 0) {
          newDoors[0] = { ...newDoors[0], [property]: change.newValue }
        } else if (entityType === 'key' && newKeys.length > 0) {
          newKeys[0] = { ...newKeys[0], [property]: change.newValue }
        }
      } else if (change.changeType === 'DELETE' && property === 'id') {
        // Just remove the first one for mock purposes, or try to match ID if it was in currentValue (but change interface only gives newValue to applyChanges)
        if (entityType === 'user') newUsers.shift()
        else if (entityType === 'door') newDoors.shift()
        else if (entityType === 'key') newKeys.shift()
      }
    }

    return { users: newUsers, doors: newDoors, keys: newKeys }
  })
}))
