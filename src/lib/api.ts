export interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface ApiResponse<T> {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: T[];
}

const BASE_URL = 'https://rickandmortyapi.com/api';

export async function getCharacters(params: {
  page?: number;
  name?: string;
  status?: string;
  species?: string;
} = {}): Promise<ApiResponse<Character>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.name) searchParams.append('name', params.name);
  if (params.status) searchParams.append('status', params.status);
  if (params.species) searchParams.append('species', params.species);

  const res = await fetch(`${BASE_URL}/character?${searchParams.toString()}`);
  if (!res.ok) {
    if (res.status === 404) {
      return { info: { count: 0, pages: 0, next: null, prev: null }, results: [] };
    }
    throw new Error('Failed to fetch characters');
  }
  return res.json();
}

export async function getCharacter(id: string | number): Promise<Character> {
  const res = await fetch(`${BASE_URL}/character/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch character');
  }
  return res.json();
}
