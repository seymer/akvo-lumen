(ns org.akvo.dash.import.csv
  (:require [clojure.java.io :as io]
            [clojure.string :as s]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.csv :as csv]
            [hugsql.core :as hugsql]
            [org.akvo.dash.util :refer [squuid]]
            [org.akvo.dash.import.common :refer (make-dataset-data-table)])
  (:import org.postgresql.copy.CopyManager
           org.postgresql.core.BaseConnection
           java.util.UUID))

(hugsql/def-db-fns "org/akvo/dash/import.sql")

(defn- get-cols
  ([num-cols]
   (get-cols num-cols nil))
  ([num-cols c-type]
   (s/join ", "
           (for [i (range 1 (inc num-cols))]
             (str "c" i
                  (if-not (nil? c-type)
                    (str " " c-type)
                    ""))))))

(defn- gen-table-name
  []
  (str "ds_" (s/replace (UUID/randomUUID) #"-" "_")))

(defn get-create-table-sql
  "Returns a `CREATE TABLE` statement for
  the given number table name and number of columns"
  [t-name num-cols c-type temp?]
  (format "CREATE %s %s (%s, %s)"
          (if temp? "TEMP TABLE" "TABLE")
          t-name
          (if temp? "rnum serial" "rnum integer")
          (get-cols num-cols c-type)))

(defn get-copy-sql
  "Returns a `COPY` statement for the given
  table and number of columns"
  [t-name num-cols headers?]
  (format "COPY %s (%s) FROM STDIN WITH (FORMAT CSV%s)"
          t-name
          (get-cols num-cols)
          (if headers? ", HEADER true" "")))

(defn get-insert-sql
  "Returns an `INSERT` statement for a given
  table and number of columns."
  [src-table dest-table num-cols]
  (let [cols (for [i (range 1 (inc num-cols))]
               (str "c" i))
        src-cols (map #(format "to_json(replace(%s, '\\', '\\\\'))::jsonb" %) cols)]
    (format "INSERT INTO %s (rnum, %s) SELECT rnum, %s FROM %s"
            dest-table
            (s/join ", " cols)
            (s/join ", " src-cols)
            src-table)))

(defn get-vacuum-sql
  "Returns a `VACUUM` statement for a given table"
  [table-name]
  (format "VACUUM (FULL) %s" table-name))

(defn get-drop-table-sql
  "Returns a `DROP TABLE` statement for a given table"
  [table-name]
  (format "DROP TABLE IF EXISTS %s CASCADE" table-name))

(defn get-headers
  "Returns the first line CSV a file"
  [path separator]
  (with-open [r (io/reader path)]
    (first (csv/read-csv r :separator separator))))

(defn get-num-cols
  "Returns the number of columns based on the
  first lie of a CSV file"
  [path separator]
  (count (get-headers path separator)))

(defn get-column-tuples
  [col-titles]
  (vec
   (map-indexed (fn [idx title]
                  [title (str "c" (inc idx)) "text"]) col-titles)))

(defmethod make-dataset-data-table "csv" [tenant-conn config table-name spec]
  (let [;; TODO a bit of "manual" integration work
        file-on-disk? (contains? spec "fileName")
        path (let [url (get spec "url")]
               (if file-on-disk?
                 (str "/tmp/akvo/dash/resumed/"
                      (last (s/split url #"\/"))
                      "/file")
                 url))
        ;; TODO spec will have string keys since & probably no '&' as
        ;; that's not really idiomatic in json. Perhaps 'hasHeaders'
        ;; instead?
        headers? (:headers? spec)
        n-cols (get-num-cols path \,)
        col-titles (if headers?
                     (get-headers path \,)
                     (vec (for [i (range 1 (inc n-cols))]
                            (str "Column " i))))
        temp-table (str table-name "_temp")
        copy-manager (CopyManager. (cast BaseConnection (.unwrap (.getConnection (:datasource tenant-conn)) BaseConnection)))]
    (jdbc/execute! tenant-conn [(get-create-table-sql temp-table n-cols "text" false)])
    (jdbc/execute! tenant-conn [(get-create-table-sql table-name n-cols "jsonb" false)])
    (.copyIn copy-manager ^String (get-copy-sql temp-table n-cols headers?) (io/input-stream path))
    (jdbc/execute! tenant-conn [(get-insert-sql temp-table table-name n-cols)])
    (jdbc/execute! tenant-conn [(get-drop-table-sql temp-table)])
    (jdbc/execute! tenant-conn [(get-vacuum-sql table-name)] :transaction? false)
    {:success? true
     :columns (get-column-tuples col-titles)}))
