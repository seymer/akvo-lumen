-- :name combine-columns :!
UPDATE :i:table-name
SET :i:new-column-name = :i:first-column || :separator || :i:second-column
