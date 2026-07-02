create table public.oid_assets (
  id bigint generated always as identity primary key,
  asset_key text not null unique,
  dotted_oid text not null,
  friendly_name text not null,
  category text not null,
  source_note text not null,
  owner_team text,
  created_at timestamptz not null default now()
);

create table public.oid_findings (
  id bigint generated always as identity primary key,
  oid_asset_id bigint not null references public.oid_assets(id) on delete cascade,
  severity text not null check (severity in ('low', 'medium', 'high')),
  finding_type text not null,
  reviewer_note text not null,
  status text not null default 'open' check (status in ('open', 'triaged', 'accepted', 'resolved')),
  action_owner text,
  updated_at timestamptz not null default now()
);

create index oid_assets_dotted_oid_idx on public.oid_assets (dotted_oid);
create index oid_assets_category_idx on public.oid_assets (category);
create index oid_findings_status_idx on public.oid_findings (status);
create index oid_findings_severity_idx on public.oid_findings (severity);

insert into public.oid_assets (asset_key, dotted_oid, friendly_name, category, source_note, owner_team)
values
  ('internet-root', '1.3.6.1', 'Internet', 'internet', 'Public sample branch used for tutorial review workflows.', 'platform'),
  ('private-enterprise-root', '1.3.6.1.4.1', 'Private Enterprise Numbers', 'private-enterprise', 'Public branch for enterprise-assigned identifiers.', null),
  ('x509-key-usage', '2.5.29.15', 'Key Usage', 'certificate', 'Public X.509 extension identifier.', 'security'),
  ('x509-extended-key-usage', '2.5.29.37', 'Extended Key Usage', 'certificate', 'Public X.509 extension identifier.', 'security'),
  ('tls-server-auth', '1.3.6.1.5.5.7.3.1', 'TLS Web Server Authentication', 'security', 'Public PKIX extended key usage sample.', 'security');

insert into public.oid_findings (oid_asset_id, severity, finding_type, reviewer_note, status, action_owner)
select id, 'medium', 'missing_owner', 'Assign a review owner before publishing a derived inventory summary.', 'open', 'platform'
from public.oid_assets
where asset_key = 'private-enterprise-root';

insert into public.oid_findings (oid_asset_id, severity, finding_type, reviewer_note, status, action_owner)
select id, 'low', 'certificate_context', 'Document where the certificate extension appears in the release handoff.', 'triaged', 'security'
from public.oid_assets
where asset_key = 'x509-extended-key-usage';

insert into public.oid_findings (oid_asset_id, severity, finding_type, reviewer_note, status, action_owner)
select id, 'high', 'publication_boundary', 'Verify that exports include only sanitized derived notes, not private scans or credential-bearing files.', 'open', 'security'
from public.oid_assets
where asset_key = 'tls-server-auth';
