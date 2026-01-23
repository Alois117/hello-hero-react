import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Host {
  hostid: string;
  host: string;
  name: string;
  ip: string | null;
  hostgroups: string[];

  hostname: string;
  hostgroup: string;
  cpu_usage: string;
  memory_usage: string;
  disk_usage: string;
  uptime_days: string;
  host_type: string;
  last_checked: string;
}

interface HostsState {
  hosts: Host[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: HostsState = {
  hosts: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const WEBHOOK_URL = "http://10.100.12.54:5678/webhook/zabbix/host-details";

// 🔁 Normalize API host to UI-safe host
const transformHost = (raw: any): Host => {
  return {
    hostid: raw.hostid,
    host: raw.hostname,
    name: raw.hostname,
    ip: raw.ip ?? null,

    hostgroups: raw.hostgroup ? [raw.hostgroup] : [],

    hostname: raw.hostname ?? "Unknown",
    hostgroup: raw.hostgroup ?? "Uncategorized",
    cpu_usage: raw.cpu_usage ?? "N/A",
    memory_usage: raw.memory_usage ?? "N/A",
    disk_usage: raw.disk_usage ?? "N/A",
    uptime_days: raw.uptime_days ?? "N/A",
    host_type: raw.host_type ?? "linux",
    last_checked: raw.last_checked ?? new Date().toISOString(),
  };
};

// 🔄 Fetch with loading
export const fetchHosts = createAsyncThunk(
  "hosts/fetchHosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(WEBHOOK_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch hosts: ${response.status}`);
      }

      const rawData = await response.json();

      // ✅ Extract hosts correctly
      const hostsArray =
        Array.isArray(rawData) && rawData[0]?.hosts
          ? rawData[0].hosts
          : [];

      return hostsArray.map(transformHost);
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch hosts"
      );
    }
  }
);

// 🔄 Silent refresh
export const fetchHostsSilent = createAsyncThunk(
  "hosts/fetchHostsSilent",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(WEBHOOK_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch hosts: ${response.status}`);
      }

      const rawData = await response.json();

      const hostsArray =
        Array.isArray(rawData) && rawData[0]?.hosts
          ? rawData[0].hosts
          : [];

      return hostsArray.map(transformHost);
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch hosts"
      );
    }
  }
);

const hostsSlice = createSlice({
  name: "hosts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHosts.pending, (state) => {
        if (state.hosts.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(
        fetchHosts.fulfilled,
        (state, action: PayloadAction<Host[]>) => {
          state.hosts = action.payload;
          state.loading = false;
          state.lastUpdated = Date.now();
        }
      )
      .addCase(fetchHosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        fetchHostsSilent.fulfilled,
        (state, action: PayloadAction<Host[]>) => {
          const newData = JSON.stringify(action.payload);
          const oldData = JSON.stringify(state.hosts);

          if (newData !== oldData) {
            state.hosts = action.payload;
            state.lastUpdated = Date.now();
          }
          state.error = null;
        }
      )
      .addCase(fetchHostsSilent.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default hostsSlice.reducer;

// 🔍 Selectors
export const selectHosts = (state: { hosts: HostsState }) =>
  state.hosts.hosts;

export const selectHostsLoading = (state: { hosts: HostsState }) =>
  state.hosts.loading;

export const selectHostsError = (state: { hosts: HostsState }) =>
  state.hosts.error;

export const selectHostsLastUpdated = (state: { hosts: HostsState }) =>
  state.hosts.lastUpdated;
