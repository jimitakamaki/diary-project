<template>
  <div>

    <div v-if="entryIsOpen">
      <div v-if="editingEntry">
        <form id="editingEntryForm" v-on:submit.prevent="saveOldEntry">
          <input type="date" v-model="newDate" class="newEntryDate" required>
          <input type="text" v-model="newTitle" class="newEntryTitle" required pattern=".{1,50}" minlength="1" maxlength="50" placeholder="Title">
          <textarea required v-model="newContent" cols="30" rows="10" class="newEntryContent" minlength="1" maxlength="5000" placeholder="Content"></textarea>
          <button type="submit" form="editingEntryForm" class="newEntrySave">Save</button>
          <button v-on:click="goBack" class="newEntryCancel">Cancel</button>
        </form>
      </div>
      <div v-else>
        <div class="doneButtonDiv">
          <button v-on:click="goBack" class="done">Done</button>
        </div>

        <div class="titleDiv">
          <div>
            <h1>{{ this.activeEntry.Title}}</h1>
          </div>

          <button class="delete" v-on:click="deleteEntry">Delete</button>
          <button v-on:click="editEntry" class="edit">Edit</button>

        </div>
        <div class="dateDiv">
          <p>{{convertDate(this.activeEntry.Date)}}</p>
        </div>
        <div class="contentDiv">
          <p style="white-space: pre;">{{this.activeEntry.Content}}</p>
        </div>
      </div>
    </div>

    <div v-else-if="addingEntry">
      <form id="newEntryForm" v-on:submit.prevent="saveNewEntry">
        <input type="date" v-model="newDate" class="newEntryDate" required>
        <input type="text" v-model="newTitle" class="newEntryTitle" required pattern=".{1,50}" minlength="1" maxlength="50" placeholder="Title">
        <textarea required v-model="newContent" cols="30" rows="10" class="newEntryContent" minlength="1" maxlength="5000" placeholder="Content"></textarea>
        <button type="submit" form="newEntryForm" class="newEntrySave">Save</button>
        <button v-on:click="goBack" class="newEntryCancel">Cancel</button>
      </form>

    </div>

    <div v-else>
      <div class="listTopDiv">
        <input type="search" id="searchBar" v-on:keyup="searchEntries" v-on:search="searchEntries" v-model="searchWords" placeholder="search...">
        <button v-on:click="showNewEntryCreation" class="new">New</button>
      </div>

      <table v-if="searchActive">
        <tr v-for="entry in entriesFiltered" :key="entry.id">
          <div class="tr" v-on:click="showEntry(entry)">
            <p class="listTitle">{{ entry.Title }}</p>
            <div class="listContentDiv">
              <p style="white-space: pre;" class="listContent">{{ entry.Content }}</p>
            </div>
              <p class="listDate">{{convertDate(entry.Date)}}</p>
          </div>
        </tr>
      </table>
      <table v-else>
        <tr v-for="entry in entries" :key="entry.id">
          <div class="tr" v-on:click="showEntry(entry)">
            <p class="listTitle">{{ entry.Title }}</p>
            <div class="listContentDiv">
              <p style="white-space: pre;" class="listContent">{{ entry.Content }}</p>
            </div>
            <p class="listDate">{{convertDate(entry.Date)}}</p>
          </div>
        </tr>
      </table>
      <p v-if="entries.length == 0" id="noEntries">No entries</p>
    </div>

  </div>
</template>

<script>
export default {
  name: "EntriesList",
  data() {
    return {
      entries: [],
      entriesFiltered: [],
      entryIsOpen: false,
      addingEntry: false,
      activeEntry: null,
      editingEntry: false,

      newDate: "",
      newTitle: "",
      newContent: "",

      searchWords: "",
      searchActive: false
    }
  },
  mounted() {
    this.getEntries()
  },
  methods: {
    /**
     * Hakee listan merkinnöistä palvelimen kautta
     */
    async getEntries() {
      try {
        let response = await fetch("http://localhost:8081/api/entries")
        let data = await response.json()
        console.log(data)
        this.entries = data
        await this.entries.reverse()
      } catch (error) {
        console.error(error)
      }
    },
    /**
     * Aktivoituu kun käyttäjä kirjoittaa hakupalkkiin. Hakee entries listasta merkintöjä annetuilla hakusanoilla.
     */
    searchEntries() {
      if (this.searchWords.length) {
        this.searchActive = true
        this.entriesFiltered = []
      } else {
        this.searchActive = false
      }
      for (let i = 0; i < this.entries.length; i++) {
        if (this.entries[i].Title.toLowerCase().includes(this.searchWords.toLowerCase()) || this.entries[i].Content.toLowerCase().includes(this.searchWords.toLowerCase()) || this.convertDate(this.entries[i].Date).includes(this.searchWords)) {
          this.entriesFiltered.push(this.entries[i])
          console.log(this.entriesFiltered)
        }
      }
    },
    /**
     * Avaa merkinnän katselun.
     */
    showEntry(entry) {
      this.activeEntry = entry
      this.entryIsOpen = true
    },
    /**
     * Muuttaa annetun päivämäärämerkinnän muotoa muotoon dd.mm.yyyy
     */
    convertDate(date) {
      let jsDate = new Date(date)
      let day = jsDate.getDate()
      let month = jsDate.getMonth() + 1
      let year = jsDate.getUTCFullYear()
      return day + "." + month + "." + year
    },
    /**
     * Avaa uuden merkinnän luonnin
     */
    showNewEntryCreation() {
      let today = new Date()
      let year = today.getFullYear() + ""
      let month = today.getMonth() + 1 + ""
      let day = today.getDate() + ""
      this.newDate = year + "-" + month.padStart(2, 0) + "-" + day.padStart(2, 0)
      this.addingEntry = true;
    },
    /**
     * Tallentaa uuden merkinnän
     */
    async saveNewEntry() {
      let data = { "Date": this.newDate, "Title": this.newTitle, "Content": this.newContent }
      console.log(data)

      let xhr = new XMLHttpRequest()

      await xhr.open("POST", "http://localhost:8081/api/new-entry", true)

      await xhr.setRequestHeader("Content-Type", "application/json")

      let string = JSON.stringify(data)
      await xhr.send(string)

      setTimeout(this.goBack, 100)

      this.newTitle = ""
      this.newContent = ""
    },
    /**
     * Poistaa halutun merkinnän
     */
    async deleteEntry() {
      let xhr = new XMLHttpRequest()
      await xhr.open("POST", "http://localhost:8081/api/delete-entry", true)
      await xhr.setRequestHeader("Content-Type", "application/json")

      let string = JSON.stringify((this.activeEntry))
      await xhr.send(string)

      setTimeout(this.goBack, 100)
    },
    /**
     * Palauttaa näkymän alkusivulle
     */
    goBack() {
      this.getEntries()
      this.activeEntry = null
      this.entryIsOpen = false
      this.editingEntry = false
      this.addingEntry = false
    },
    /**
     * avaa merkinnän muokkausnäkymän
     */
    editEntry() {
      this.editingEntry = true

      let jsDate = new Date(this.activeEntry.Date)
      let year = jsDate.getFullYear() + ""
      let month = jsDate.getMonth() + 1 + ""
      let date = jsDate.getDate() + ""

      this.newDate = year + "-" + month.padStart(2, 0) + "-" + date.padStart(2, 0)
      this.newTitle = this.activeEntry.Title
      this.newContent = this.activeEntry.Content
    },
    /**
     * Tallentaa muokatun merkinnän
     */
    async saveOldEntry() {
      let data = { "Date": this.newDate, "Title": this.newTitle, "Content": this.newContent, "id": this.activeEntry.id }
      let string = JSON.stringify(data)

      let xhr = new XMLHttpRequest()
      await xhr.open("POST", "http://localhost:8081/api/edit-entry", true)
      await xhr.setRequestHeader("Content-Type", "application/json")
      await xhr.send(string)

      setTimeout(this.refreshActiveEntry, 100)
    },
    /**
     * Päivittää activeEntry -muuttujan tiedot editoinnin jälkeen
     */
    async refreshActiveEntry() {
      await this.getEntries()
      for (let i = 0; i < this.entries.length; i++) {
        if (this.activeEntry.id == this.entries[i].id) {
          console.log("match")
          this.activeEntry = this.entries[i]
        }
      }
      this.editingEntry = false
      this.newTitle = ""
      this.newContent = ""
    }
  }
}
</script>

<style scoped>

</style>