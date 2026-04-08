#!/usr/bin/env python3
import sys
import os
import json
import re

try:
    import pandas as pd
except Exception as e:
    print('Missing pandas - install with: pip install pandas pyxlsb python-dateutil', file=sys.stderr)
    raise

from datetime import datetime

def normalize_col_name(s):
    return re.sub(r'[^a-z0-9]', '', s.lower() if isinstance(s, str) else '')

# canonical fields we care about
CANDIDATES = {
    'projectid': 'project_id',
    'project': 'project_name',
    'projectname': 'project_name',
    'person': 'person_name',
    'personname': 'person_name',
    'resource': 'person_name',
    'date': 'date',
    'day': 'date',
    'hours': 'hours',
    'time': 'hours',
    'cost': 'cost',
    'amount': 'cost',
    'phase': 'phase',
    'budget': 'budget',
    'plannedstart': 'planned_start',
    'plannedend': 'planned_end',
    'actualstart': 'actual_start',
    'actualend': 'actual_end'
}

def map_columns(cols):
    mapping = {}
    for c in cols:
        norm = normalize_col_name(c)
        mapped = None
        # exact candidate
        if norm in CANDIDATES:
            mapped = CANDIDATES[norm]
        else:
            # fuzzy contains
            for k, v in CANDIDATES.items():
                if k in norm:
                    mapped = v
                    break
        if mapped:
            mapping[c] = mapped
        else:
            mapping[c] = c  # keep original
    return mapping


def coerce_value(val, field=None):
    if pd.isna(val):
        return None
    if val is None:
        return None
    # strip surrounding whitespace
    s = str(val).strip()
    if s == '':
        return None
    if field in ('hours',):
        try:
            return float(str(s).replace(',', ''))
        except Exception:
            return None
    if field in ('cost', 'budget'):
        try:
            return float(str(s).replace(',', '').replace('$',''))
        except Exception:
            return None
    if field in ('date', 'planned_start', 'planned_end', 'actual_start', 'actual_end'):
        # try to parse common date formats
        for fmt in ('%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d'):
            try:
                return datetime.strptime(s, fmt).date().isoformat()
            except Exception:
                pass
        # fallback: let pandas try
        try:
            ts = pd.to_datetime(s, errors='coerce')
            if pd.isna(ts):
                return s
            return ts.date().isoformat()
        except Exception:
            return s
    return s


def process_table(df, mapping):
    rows = []
    for _, r in df.iterrows():
        out = {}
        for src_col, dst in mapping.items():
            raw = r.get(src_col)
            out[dst] = coerce_value(raw, dst)
        rows.append(out)
    return rows


def aggregate(rows):
    projects = {}
    for r in rows:
        pid = r.get('project_id') or r.get('project_name') or 'unknown'
        pname = r.get('project_name') or pid
        proj = projects.setdefault(pid, {'project_id': pid, 'project_name': pname, 'total_hours': 0.0, 'total_cost': 0.0, 'people': {}})
        hours = r.get('hours') or 0
        cost = r.get('cost') or 0
        try:
            proj['total_hours'] += float(hours)
        except Exception:
            pass
        try:
            proj['total_cost'] += float(cost)
        except Exception:
            pass
        person = r.get('person_name') or 'unknown'
        p = proj['people'].setdefault(person, {'hours': 0.0, 'cost': 0.0})
        try:
            p['hours'] += float(hours)
        except Exception:
            pass
        try:
            p['cost'] += float(cost)
        except Exception:
            pass
    # convert people dict to list
    out = []
    for pid, val in projects.items():
        people = [{'person_name': name, 'hours': data['hours'], 'cost': data['cost']} for name, data in val['people'].items()]
        out.append({
            'project_id': val['project_id'],
            'project_name': val['project_name'],
            'total_hours': val['total_hours'],
            'total_cost': val['total_cost'],
            'people': people
        })
    return out


def main():
    if len(sys.argv) < 3:
        print('Usage: process_report.py <uploaded-path> <output-base-no-ext>', file=sys.stderr)
        sys.exit(2)
    uploaded = sys.argv[1]
    outbase = sys.argv[2]

    # uploaded may have .uploaded suffix -> derive actual filename
    if uploaded.endswith('.uploaded'):
        inp = uploaded[:-len('.uploaded')]
    else:
        inp = uploaded

    # if inp doesn't exist, try uploaded (copied path)
    if not os.path.exists(inp) and os.path.exists(uploaded):
        inp = uploaded

    if not os.path.exists(inp):
        print('Input file not found:', inp, file=sys.stderr)
        sys.exit(1)

    name = os.path.basename(inp)
    ext = name.split('.')[-1].lower()

    try:
        if ext == 'xlsb':
            df = pd.read_excel(inp, engine='pyxlsb')
        elif ext in ('xls', 'xlsx'):
            df = pd.read_excel(inp)
        elif ext == 'csv':
            df = pd.read_csv(inp)
        elif ext in ('json'):
            # assume array of objects
            with open(inp, 'r', encoding='utf-8') as f:
                arr = json.load(f)
            df = pd.DataFrame(arr)
        else:
            # try csv fallback
            df = pd.read_csv(inp)
    except Exception as e:
        print('Failed to read file:', e, file=sys.stderr)
        sys.exit(1)

    # ensure columns are strings
    cols = [c for c in df.columns]
    mapping = map_columns(cols)

    rows = process_table(df, mapping)

    ndjson_path = outbase + '.ndjson'
    json_summary_path = outbase + '.json'

    with open(ndjson_path, 'w', encoding='utf-8') as out:
        for r in rows:
            out.write(json.dumps(r, ensure_ascii=False) + '\n')

    summary = aggregate(rows)
    with open(json_summary_path, 'w', encoding='utf-8') as f:
        json.dump({'projects': summary}, f, ensure_ascii=False, indent=2)

    print('Processed:', ndjson_path, json_summary_path)

if __name__ == '__main__':
    main()
