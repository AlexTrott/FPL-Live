export interface Team {
  code: number
  draw: number
  form: null | string
  id: number
  loss: number
  name: string
  played: number
  points: number
  position: number
  short_name: string
  strength: number
  team_division: null
  unavailable: boolean
  win: number
  strength_overall_home: number
  strength_overall_away: number
  strength_attack_home: number
  strength_attack_away: number
  strength_defence_home: number
  strength_defence_away: number
  pulse_id: number
}

export interface Player {
  chance_of_playing_next_round: number | null
  chance_of_playing_this_round: number | null
  code: number
  cost_change_event: number
  cost_change_event_fall: number
  cost_change_start: number
  cost_change_start_fall: number
  dreamteam_count: number
  element_type: number
  ep_next: string
  ep_this: string
  event_points: number
  first_name: string
  form: string
  id: number
  in_dreamteam: boolean
  news: string
  news_added: string | null
  now_cost: number
  photo: string
  points_per_game: string
  second_name: string
  selected_by_percent: string
  special: boolean
  squad_number: number | null
  status: string
  team: number
  team_code: number
  total_points: number
  transfers_in: number
  transfers_in_event: number
  transfers_out: number
  transfers_out_event: number
  value_form: string
  value_season: string
  web_name: string
  minutes: number
  goals_scored: number
  assists: number
  clean_sheets: number
  goals_conceded: number
  own_goals: number
  penalties_saved: number
  penalties_missed: number
  yellow_cards: number
  red_cards: number
  saves: number
  bonus: number
  bps: number
  influence: string
  creativity: string
  threat: string
  ict_index: string
  starts: number
  expected_goals: string
  expected_assists: string
  expected_goal_involvements: string
  expected_goals_conceded: string
  influence_rank: number
  influence_rank_type: number
  creativity_rank: number
  creativity_rank_type: number
  threat_rank: number
  threat_rank_type: number
  ict_index_rank: number
  ict_index_rank_type: number
  corners_and_indirect_freekicks_order: number | null
  corners_and_indirect_freekicks_text: string
  direct_freekicks_order: number | null
  direct_freekicks_text: string
  penalties_order: number | null
  penalties_text: string
  expected_goals_per_90: number
  saves_per_90: number
  expected_assists_per_90: number
  expected_goal_involvements_per_90: number
  expected_goals_conceded_per_90: number
  goals_conceded_per_90: number
  now_cost_rank: number
  now_cost_rank_type: number
  form_rank: number
  form_rank_type: number
  points_per_game_rank: number
  points_per_game_rank_type: number
  selected_rank: number
  selected_rank_type: number
  starts_per_90: number
  clean_sheets_per_90: number
}

export interface ElementType {
  id: number
  plural_name: string
  plural_name_short: string
  singular_name: string
  singular_name_short: string
  squad_select: number
  squad_min_play: number
  squad_max_play: number
  ui_shirt_specific: boolean
  sub_positions_locked: number[]
  element_count: number
}

export interface Event {
  id: number
  name: string
  deadline_time: string
  average_entry_score: number
  finished: boolean
  data_checked: boolean
  highest_scoring_entry: number | null
  deadline_time_epoch: number
  deadline_time_game_offset: number
  highest_score: number | null
  is_previous: boolean
  is_current: boolean
  is_next: boolean
  cup_leagues_created: boolean
  h2h_ko_matches_created: boolean
  chip_plays: Array<{
    chip_name: string
    num_played: number
  }>
  most_selected: number | null
  most_transferred_in: number | null
  top_element: number | null
  top_element_info: {
    id: number
    points: number
  } | null
  transfers_made: number
  most_captained: number | null
  most_vice_captained: number | null
}

export interface Fixture {
  code: number
  event: number | null
  finished: boolean
  finished_provisional: boolean
  id: number
  kickoff_time: string | null
  minutes: number
  provisional_start_time: boolean
  started: boolean | null
  team_a: number
  team_a_score: number | null
  team_h: number
  team_h_score: number | null
  stats: Array<{
    identifier: string
    a: Array<{
      value: number
      element: number
    }>
    h: Array<{
      value: number
      element: number
    }>
  }>
  team_h_difficulty: number
  team_a_difficulty: number
  pulse_id: number
}

export interface BootstrapStatic {
  events: Event[]
  game_settings: {
    league_join_private_max: number
    league_join_public_max: number
    league_max_size_public_classic: number
    league_max_size_public_h2h: number
    league_max_size_private_h2h: number
    league_max_ko_rounds_private_h2h: number
    league_prefix_public: string
    league_points_h2h_win: number
    league_points_h2h_lose: number
    league_points_h2h_draw: number
    league_ko_first_instead_of_random: boolean
    cup_start_event_id: number | null
    cup_stop_event_id: number | null
    cup_qualifying_method: string | null
    cup_type: string | null
    squad_squadplay: number
    squad_squadsize: number
    squad_team_limit: number
    squad_total_spend: number
    ui_currency_multiplier: number
    ui_use_special_shirts: boolean
    ui_special_shirt_exclusions: any[]
    stats_form_days: number
    sys_vice_captain_enabled: boolean
    transfers_cap: number
    transfers_sell_on_fee: number
    league_h2h_tiebreak_stats: string[]
    timezone: string
  }
  phases: Array<{
    id: number
    name: string
    start_event: number
    stop_event: number
  }>
  teams: Team[]
  total_players: number
  elements: Player[]
  element_stats: Array<{
    label: string
    name: string
  }>
  element_types: ElementType[]
}

export interface ManagerInfo {
  id: number
  joined_time: string
  started_event: number
  favourite_team: number | null
  player_first_name: string
  player_last_name: string
  player_region_id: number
  player_region_name: string
  player_region_iso_code_short: string
  player_region_iso_code_long: string
  summary_overall_points: number
  summary_overall_rank: number | null
  summary_event_points: number
  summary_event_rank: number | null
  current_event: number
  leagues: {
    classic: Array<{
      id: number
      name: string
      short_name: string | null
      created: string
      closed: boolean
      rank: number | null
      max_entries: number | null
      league_type: string
      scoring: string
      admin_entry: number | null
      start_event: number
      entry_can_leave: boolean
      entry_can_admin: boolean
      entry_can_invite: boolean
      has_cup: boolean
      cup_league: number | null
      cup_qualified: boolean | null
      rank_count: number | null
      entry_percentile_rank: number
      entry_rank: number
      entry_last_rank: number
    }>
    h2h: any[]
    cup: {
      matches: any[]
      status: {
        qualification_event: number | null
        qualification_numbers: number | null
        qualification_rank: number | null
        qualification_state: string | null
      }
      cup_league: number | null
    }
    cup_matches: any[]
  }
  name: string
  name_change_blocked: boolean
  kit: string | null
  last_deadline_bank: number
  last_deadline_value: number
  last_deadline_total_transfers: number
}

export interface ManagerHistory {
  current: Array<{
    event: number
    points: number
    total_points: number
    rank: number
    rank_sort: number
    overall_rank: number
    bank: number
    value: number
    event_transfers: number
    event_transfers_cost: number
    points_on_bench: number
  }>
  past: Array<{
    season_name: string
    total_points: number
    rank: number
  }>
  chips: Array<{
    name: string
    time: string
    event: number
  }>
}

export interface ManagerPick {
  element: number
  position: number
  multiplier: number
  is_captain: boolean
  is_vice_captain: boolean
}

export interface ManagerPicks {
  active_chip: string | null
  automatic_subs: Array<{
    entry: number
    element_in: number
    element_out: number
    event: number
  }>
  entry_history: {
    event: number
    points: number
    total_points: number
    rank: number
    rank_sort: number
    overall_rank: number
    bank: number
    value: number
    event_transfers: number
    event_transfers_cost: number
    points_on_bench: number
  }
  picks: ManagerPick[]
}

export interface LiveElement {
  id: number
  stats: {
    minutes: number
    goals_scored: number
    assists: number
    clean_sheets: number
    goals_conceded: number
    own_goals: number
    penalties_saved: number
    penalties_missed: number
    yellow_cards: number
    red_cards: number
    saves: number
    bonus: number
    bps: number
    influence: string
    creativity: string
    threat: string
    ict_index: string
    starts: number
    expected_goals: string
    expected_assists: string
    expected_goal_involvements: string
    expected_goals_conceded: string
    total_points: number
  }
  explain: Array<{
    fixture: number
    stats: Array<{
      identifier: string
      points: number
      value: number
    }>
  }>
}

export interface Live {
  elements: LiveElement[]
}

export interface LeagueStandings {
  new_entries: {
    has_next: boolean
    page: number
    results: any[]
  }
  last_updated_data: string
  league: {
    id: number
    name: string
    created: string
    closed: boolean
    max_entries: number | null
    league_type: string
    scoring: string
    admin_entry: number | null
    start_event: number
    code_privacy: string
    has_cup: boolean
    cup_league: number | null
    rank: number | null
  }
  standings: {
    has_next: boolean
    page: number
    results: Array<{
      id: number
      event_total: number
      player_name: string
      rank: number
      last_rank: number
      rank_sort: number
      total: number
      entry: number
      entry_name: string
    }>
  }
}